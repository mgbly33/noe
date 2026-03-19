import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';

describe('Follow-up, History, and Admin (e2e)', () => {
  let app: INestApplication<App>;

  const unwrapData = <T>(body: unknown) => {
    if (!body || typeof body !== 'object' || !('data' in body)) {
      throw new Error('Response body does not include a data field.');
    }

    return (body as { data: T }).data;
  };

  const createConsentedToken = async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        login_type: 'guest',
        device_id: `device_${Date.now()}_task8`,
        channel: 'h5',
      });
    const loginData = unwrapData<{ token: string }>(loginResponse.body);
    const token = loginData.token;

    await request(app.getHttpServer())
      .post('/consent/accept')
      .set('Authorization', `Bearer ${token}`)
      .send({
        privacy_version: 'v1.0',
        disclaimer_version: 'v1.0',
        ai_notice_version: 'v1.0',
        age_notice_version: 'v1.0',
        accepted: true,
      });

    return token;
  };

  const createReadyReading = async (token: string) => {
    const sessionResponse = await request(app.getHttpServer())
      .post('/session/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        topic_type: 'career',
        question_text: `How should I handle this choice? ${Date.now()}`,
        entry_channel: 'h5',
      });
    const sessionData = unwrapData<{
      session_id: string;
      recommended_skus: string[];
    }>(sessionResponse.body);
    const skuId = sessionData.recommended_skus[0];

    if (!skuId) {
      throw new Error('Expected at least one recommended SKU.');
    }

    const orderResponse = await request(app.getHttpServer())
      .post('/orders/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        session_id: sessionData.session_id,
        sku_id: skuId,
        source: 'question_page',
      });
    const orderData = unwrapData<{ order_id: string }>(orderResponse.body);

    await request(app.getHttpServer())
      .post('/payments/mock/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ order_id: orderData.order_id });
    await request(app.getHttpServer())
      .post('/payments/mock/callback')
      .send({ order_id: orderData.order_id });

    const createResponse = await request(app.getHttpServer())
      .post('/readings/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        session_id: sessionData.session_id,
      });
    const createData = unwrapData<{ reading_id: string }>(createResponse.body);

    await request(app.getHttpServer())
      .post(`/readings/${createData.reading_id}/draw`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reversed_enabled: false });

    await request(app.getHttpServer())
      .post(`/readings/${createData.reading_id}/generate`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        style: 'gentle',
        disclaimer_version: 'v1.0',
      });

    return createData.reading_id;
  };

  const createAdminToken = async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        login_type: 'local_admin',
        login_name: 'admin',
        password: 'admin123456',
        channel: 'ops_console',
      });

    return unwrapData<{ token: string }>(response.body).token;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('keeps follow-up tied to the current reading only', async () => {
    const token = await createConsentedToken();
    const firstReadingId = await createReadyReading(token);
    const secondReadingId = await createReadyReading(token);

    const replyResponse = await request(app.getHttpServer())
      .post(`/readings/${firstReadingId}/follow-up`)
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'What happens if I choose option A?' });
    const replyData = unwrapData<{
      reading_id: string;
      reply: string;
    }>(replyResponse.body);

    const secondReadingResponse = await request(app.getHttpServer())
      .get(`/readings/${secondReadingId}`)
      .set('Authorization', `Bearer ${token}`);
    const secondReadingData = unwrapData<{
      reading_status: string;
    }>(secondReadingResponse.body);

    expect(replyResponse.status).toBe(201);
    expect(replyData.reading_id).toBe(firstReadingId);
    expect(replyData.reply).toBeTruthy();
    expect(secondReadingResponse.status).toBe(200);
    expect(secondReadingData.reading_status).toBe('READY');
  });

  it('returns reading history and removes archived readings after delete', async () => {
    const token = await createConsentedToken();
    const readingId = await createReadyReading(token);

    const historyBeforeDelete = await request(app.getHttpServer())
      .get('/readings/history')
      .set('Authorization', `Bearer ${token}`);
    const beforeData = unwrapData<{
      items: Array<{ reading_id: string }>;
    }>(historyBeforeDelete.body);

    const deleteResponse = await request(app.getHttpServer())
      .delete(`/readings/${readingId}`)
      .set('Authorization', `Bearer ${token}`);

    const historyAfterDelete = await request(app.getHttpServer())
      .get('/readings/history')
      .set('Authorization', `Bearer ${token}`);
    const afterData = unwrapData<{
      items: Array<{ reading_id: string }>;
    }>(historyAfterDelete.body);

    expect(historyBeforeDelete.status).toBe(200);
    expect(beforeData.items.some((item) => item.reading_id === readingId)).toBe(
      true,
    );
    expect(deleteResponse.status).toBe(200);
    expect(historyAfterDelete.status).toBe(200);
    expect(afterData.items.some((item) => item.reading_id === readingId)).toBe(
      false,
    );
  });

  it('publishes a prompt policy and uses it for new generations', async () => {
    const token = await createConsentedToken();

    await request(app.getHttpServer())
      .post('/question/check-risk')
      .set('Authorization', `Bearer ${token}`)
      .send({
        question_text: 'I do not want to live anymore',
        topic_type: 'emotion',
      });

    const firstReadingId = await createReadyReading(token);
    const adminToken = await createAdminToken();

    const readingsResponse = await request(app.getHttpServer())
      .get('/admin/readings')
      .set('Authorization', `Bearer ${adminToken}`);
    const readingsData = unwrapData<{
      items: Array<{ reading_id: string }>;
    }>(readingsResponse.body);

    const riskEventsResponse = await request(app.getHttpServer())
      .get('/admin/risk-events')
      .set('Authorization', `Bearer ${adminToken}`);
    const riskEventsData = unwrapData<{
      items: Array<{ risk_level: string }>;
    }>(riskEventsResponse.body);

    const publishResponse = await request(app.getHttpServer())
      .post('/admin/prompt-policies/publish')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ policy_version: 'prompt_policy_v2' });
    const publishData = unwrapData<{
      policy_version: string;
    }>(publishResponse.body);

    const secondReadingId = await createReadyReading(token);
    const secondReadingResponse = await request(app.getHttpServer())
      .get(`/readings/${secondReadingId}`)
      .set('Authorization', `Bearer ${token}`);
    const secondReadingData = unwrapData<{
      interpretation: { policy_version: string } | null;
    }>(secondReadingResponse.body);

    expect(readingsResponse.status).toBe(200);
    expect(
      readingsData.items.some((item) => item.reading_id === firstReadingId),
    ).toBe(true);
    expect(riskEventsResponse.status).toBe(200);
    expect(
      riskEventsData.items.some((item) => item.risk_level === 'BLOCK'),
    ).toBe(true);
    expect(publishResponse.status).toBe(201);
    expect(publishData.policy_version).toBe('prompt_policy_v2');
    expect(secondReadingResponse.status).toBe(200);
    expect(secondReadingData.interpretation?.policy_version).toBe(
      'prompt_policy_v2',
    );
  });
});

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';

describe('Readings, Draw, and Generate (e2e)', () => {
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
        device_id: `device_${Date.now()}_reading`,
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

  const createPaidSession = async (token: string) => {
    const sessionResponse = await request(app.getHttpServer())
      .post('/session/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        topic_type: 'career',
        question_text: `Should I switch jobs now? ${Date.now()}`,
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

    return {
      session_id: sessionData.session_id,
    };
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

  it('locks an entitlement, generates a reading, and consumes it on success', async () => {
    const token = await createConsentedToken();
    const session = await createPaidSession(token);

    const createResponse = await request(app.getHttpServer())
      .post('/readings/create')
      .set('Authorization', `Bearer ${token}`)
      .send(session);
    const createData = unwrapData<{
      reading_id: string;
      reading_status: string;
    }>(createResponse.body);

    const drawResponse = await request(app.getHttpServer())
      .post(`/readings/${createData.reading_id}/draw`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reversed_enabled: true });
    const drawData = unwrapData<{
      cards: Array<{ card_id: string }>;
    }>(drawResponse.body);

    const generateResponse = await request(app.getHttpServer())
      .post(`/readings/${createData.reading_id}/generate`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        style: 'gentle',
        disclaimer_version: 'v1.0',
      });
    const generateData = unwrapData<{
      structured_result: { theme: string };
      final_text: string;
    }>(generateResponse.body);

    const readingResponse = await request(app.getHttpServer())
      .get(`/readings/${createData.reading_id}`)
      .set('Authorization', `Bearer ${token}`);
    const readingData = unwrapData<{
      reading_status: string;
      interpretation: { final_text: string } | null;
    }>(readingResponse.body);

    const balanceResponse = await request(app.getHttpServer())
      .get('/assets/balance')
      .set('Authorization', `Bearer ${token}`);
    const balanceData = unwrapData<{
      total_available_count: number;
      total_locked_count: number;
    }>(balanceResponse.body);

    expect(createResponse.status).toBe(201);
    expect(createData.reading_status).toBe('DRAW_READY');
    expect(drawResponse.status).toBe(201);
    expect(drawData.cards).toHaveLength(3);
    expect(new Set(drawData.cards.map((card) => card.card_id)).size).toBe(3);
    expect(generateResponse.status).toBe(201);
    expect(generateData.structured_result.theme).toBeTruthy();
    expect(generateData.final_text).toBeTruthy();
    expect(readingResponse.status).toBe(200);
    expect(readingData.reading_status).toBe('READY');
    expect(readingData.interpretation?.final_text).toBeTruthy();
    expect(balanceResponse.status).toBe(200);
    expect(balanceData.total_available_count).toBe(0);
    expect(balanceData.total_locked_count).toBe(0);
  });

  it('releases a locked entitlement when generation fails', async () => {
    const token = await createConsentedToken();
    const session = await createPaidSession(token);

    const createResponse = await request(app.getHttpServer())
      .post('/readings/create')
      .set('Authorization', `Bearer ${token}`)
      .send(session);
    const createData = unwrapData<{
      reading_id: string;
    }>(createResponse.body);

    await request(app.getHttpServer())
      .post(`/readings/${createData.reading_id}/draw`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reversed_enabled: false });

    const generateResponse = await request(app.getHttpServer())
      .post(`/readings/${createData.reading_id}/generate`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        style: 'force_fail',
        disclaimer_version: 'v1.0',
      });

    const balanceResponse = await request(app.getHttpServer())
      .get('/assets/balance')
      .set('Authorization', `Bearer ${token}`);
    const balanceData = unwrapData<{
      total_available_count: number;
      total_locked_count: number;
    }>(balanceResponse.body);

    expect(generateResponse.status).toBe(500);
    expect(balanceResponse.status).toBe(200);
    expect(balanceData.total_available_count).toBe(1);
    expect(balanceData.total_locked_count).toBe(0);
  });
});

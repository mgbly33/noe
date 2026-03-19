import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';

describe('Orders, Payments, and Assets (e2e)', () => {
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
        device_id: `device_${Date.now()}_order`,
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

  const createQuestionSession = async (token: string) => {
    const sessionResponse = await request(app.getHttpServer())
      .post('/session/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        topic_type: 'career',
        question_text: `Should I switch jobs now? ${Date.now()}`,
        entry_channel: 'h5',
      });

    return unwrapData<{
      session_id: string;
      recommended_skus: string[];
    }>(sessionResponse.body);
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

  it('creates one order per active session and sku idempotently', async () => {
    const token = await createConsentedToken();
    const session = await createQuestionSession(token);
    const skuId = session.recommended_skus[0];

    if (!skuId) {
      throw new Error('Expected at least one recommended SKU.');
    }

    const first = await request(app.getHttpServer())
      .post('/orders/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        session_id: session.session_id,
        sku_id: skuId,
        source: 'question_page',
      });
    const second = await request(app.getHttpServer())
      .post('/orders/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        session_id: session.session_id,
        sku_id: skuId,
        source: 'question_page',
      });
    const firstData = unwrapData<{ order_id: string }>(first.body);
    const secondData = unwrapData<{ order_id: string }>(second.body);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(secondData.order_id).toBe(firstData.order_id);
  });

  it('grants credits only once when payment callback is replayed', async () => {
    const token = await createConsentedToken();
    const session = await createQuestionSession(token);
    const skuId = session.recommended_skus[0];

    if (!skuId) {
      throw new Error('Expected at least one recommended SKU.');
    }

    const orderResponse = await request(app.getHttpServer())
      .post('/orders/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        session_id: session.session_id,
        sku_id: skuId,
        source: 'question_page',
      });
    const orderData = unwrapData<{ order_id: string }>(orderResponse.body);
    const orderId = orderData.order_id;

    await request(app.getHttpServer())
      .post('/payments/mock/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ order_id: orderId });

    await request(app.getHttpServer())
      .post('/payments/mock/callback')
      .send({ order_id: orderId });
    await request(app.getHttpServer())
      .post('/payments/mock/callback')
      .send({ order_id: orderId });

    const balance = await request(app.getHttpServer())
      .get('/assets/balance')
      .set('Authorization', `Bearer ${token}`);
    const balanceData = unwrapData<{ total_available_count: number }>(
      balance.body,
    );

    expect(balance.status).toBe(200);
    expect(balanceData.total_available_count).toBe(1);
  });
});

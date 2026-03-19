import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';

describe('Risk, Session, and Catalog (e2e)', () => {
  let app: INestApplication<App>;

  const createConsentedToken = async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        login_type: 'guest',
        device_id: `device_${Date.now()}_risk`,
        channel: 'h5',
      });
    const loginBody = loginResponse.body as {
      data: {
        token: string;
      };
    };
    const token = loginBody.data.token;

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

  it('blocks self-harm input before session creation', async () => {
    const token = await createConsentedToken();

    const response = await request(app.getHttpServer())
      .post('/question/check-risk')
      .set('Authorization', `Bearer ${token}`)
      .send({
        question_text: 'I do not want to live anymore',
        topic_type: 'emotion',
      });
    const body = response.body as {
      data: {
        risk_level: string;
      };
    };

    expect(response.status).toBe(201);
    expect(body.data.risk_level).toBe('BLOCK');
  });

  it('returns recommended skus for a safe question', async () => {
    const token = await createConsentedToken();

    const response = await request(app.getHttpServer())
      .post('/session/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        topic_type: 'career',
        question_text: 'Should I switch jobs?',
        entry_channel: 'h5',
      });
    const body = response.body as {
      data: {
        recommended_skus: string[];
      };
    };

    expect(response.status).toBe(201);
    expect(body.data.recommended_skus.length).toBeGreaterThan(0);
  });
});

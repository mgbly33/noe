import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';

describe('Auth and Consent (e2e)', () => {
  let app: INestApplication<App>;

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

  it('creates a guest session token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        login_type: 'guest',
        device_id: `device_${Date.now()}`,
        channel: 'h5',
      });
    const body = response.body as {
      data: {
        need_consent: boolean;
        token: string;
      };
    };

    expect(response.status).toBe(201);
    expect(body.data.need_consent).toBe(true);
    expect(body.data.token).toBeTruthy();
  });

  it('records consent acceptance and marks the user as consented', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        login_type: 'guest',
        device_id: `device_${Date.now()}_consent`,
        channel: 'h5',
      });
    const loginBody = loginResponse.body as {
      data: {
        token: string;
      };
    };
    const token = loginBody.data.token;

    const response = await request(app.getHttpServer())
      .post('/consent/accept')
      .set('Authorization', `Bearer ${token}`)
      .send({
        privacy_version: 'v1.0',
        disclaimer_version: 'v1.0',
        ai_notice_version: 'v1.0',
        age_notice_version: 'v1.0',
        accepted: true,
      });
    const body = response.body as {
      data: {
        accepted: boolean;
      };
    };

    expect(response.status).toBe(201);
    expect(body.data.accepted).toBe(true);
  });
});

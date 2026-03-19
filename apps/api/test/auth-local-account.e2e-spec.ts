import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';

describe('Local Auth Account (e2e)', () => {
  let app: INestApplication<App>;

  const unwrapData = <T>(body: unknown) => {
    if (!body || typeof body !== 'object' || !('data' in body)) {
      throw new Error('Response body does not include a data field.');
    }

    return (body as { data: T }).data;
  };

  const createLoginName = (prefix: string) =>
    `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

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

  it('registers a local user and returns a login session', async () => {
    const loginName = createLoginName('local_user');

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        login_type: 'local',
        login_name: loginName,
        password: 'secret123',
        channel: 'h5',
      });

    const data = unwrapData<{
      user_id: string;
      token: string;
      role: string;
      login_name: string;
      need_consent: boolean;
    }>(response.body);

    expect(response.status).toBe(201);
    expect(data.user_id).toMatch(/^usr_/);
    expect(data.token).toBeTruthy();
    expect(data.role).toBe('user');
    expect(data.login_name).toBe(loginName);
    expect(data.need_consent).toBe(true);
  });

  it('rejects duplicate login names', async () => {
    const loginName = createLoginName('duplicate_user');
    const payload = {
      login_type: 'local',
      login_name: loginName,
      password: 'secret123',
      channel: 'h5',
    };

    await request(app.getHttpServer()).post('/auth/register').send(payload);
    const duplicateResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload);

    expect(duplicateResponse.status).toBe(400);
  });

  it('logs in a registered local user and resolves auth me', async () => {
    const loginName = createLoginName('login_user');
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        login_type: 'local',
        login_name: loginName,
        password: 'secret123',
        channel: 'h5',
      });
    const registerData = unwrapData<{ user_id: string }>(registerResponse.body);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        login_type: 'local',
        login_name: loginName,
        password: 'secret123',
        channel: 'h5',
      });
    const loginData = unwrapData<{
      user_id: string;
      token: string;
      role: string;
      login_name: string;
      need_consent: boolean;
    }>(loginResponse.body);

    const meResponse = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginData.token}`);
    const meData = unwrapData<{
      user_id: string;
      role: string;
      login_name: string;
      login_type: string;
      need_consent: boolean;
    }>(meResponse.body);

    expect(loginResponse.status).toBe(201);
    expect(loginData.user_id).toBe(registerData.user_id);
    expect(loginData.role).toBe('user');
    expect(loginData.login_name).toBe(loginName);
    expect(loginData.need_consent).toBe(true);
    expect(meResponse.status).toBe(200);
    expect(meData.user_id).toBe(registerData.user_id);
    expect(meData.role).toBe('user');
    expect(meData.login_name).toBe(loginName);
    expect(meData.login_type).toBe('local');
    expect(meData.need_consent).toBe(true);
  });

  it('rejects invalid local credentials', async () => {
    const loginName = createLoginName('wrong_password');

    await request(app.getHttpServer()).post('/auth/register').send({
      login_type: 'local',
      login_name: loginName,
      password: 'secret123',
      channel: 'h5',
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        login_type: 'local',
        login_name: loginName,
        password: 'not-the-same',
        channel: 'h5',
      });

    expect(loginResponse.status).toBe(401);
  });

  it('logs in the seeded admin through the unified local login path', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        login_type: 'local',
        login_name: 'admin',
        password: 'admin123456',
        channel: 'ops_console',
      });

    const data = unwrapData<{
      role: string;
      login_name: string;
      need_consent: boolean;
      token: string;
    }>(response.body);

    expect(response.status).toBe(201);
    expect(data.role).toBe('super_admin');
    expect(data.login_name).toBe('admin');
    expect(data.need_consent).toBe(false);
    expect(data.token).toBeTruthy();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('InvitationsController (e2e)', () => {
  let app: INestApplication;

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

  it('/api/v1/invitations/accept (POST) - fails with invalid token', () => {
    return request(app.getHttpServer())
      .post('/api/v1/invitations/accept')
      .send({ token: 'invalid-token' })
      .expect(404); // Or appropriate business exception status
  });
});

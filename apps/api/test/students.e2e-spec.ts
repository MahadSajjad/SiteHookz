import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Students (e2e)', () => {
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

  it('/education/students (GET)', () => {
    // Basic test placeholder
    return request(app.getHttpServer())
      .get('/api/v1/education/students')
      .expect(401); // Assuming unauthorized without auth headers
  });
  
  it('/education/students (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/education/students')
      .send({ firstName: 'Test' })
      .expect(401);
  });
});

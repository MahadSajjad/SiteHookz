import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";

describe("AuthController (e2e)", () => {
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

  it("/api/v1/auth/register (POST) - success", () => {
    return request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({
        email: "test@example.com",
        password: "Password123!",
        firstName: "Test",
        lastName: "User",
      })
      .expect(201);
  });
});

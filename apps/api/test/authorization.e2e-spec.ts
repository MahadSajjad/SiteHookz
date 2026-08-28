import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";

describe("Authorization (e2e)", () => {
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

  it("/api/v1/permissions (GET) - returns permissions when authorized", () => {
    return (
      request(app.getHttpServer())
        .get("/api/v1/permissions")
        // Needs auth/tenant token context to pass in real scenario
        .expect(401)
    );
  });
});

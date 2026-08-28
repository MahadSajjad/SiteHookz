import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";

describe("OrganizationsController (e2e)", () => {
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

  it("/api/v1/organizations (POST) - unauthenticated fails", () => {
    return request(app.getHttpServer())
      .post("/api/v1/organizations")
      .send({ name: "My Org", slug: "my-org", institutionType: "SCHOOL" })
      .expect(401);
  });
});

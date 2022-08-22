import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;

describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection("localhost");
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show a user profile", async () => {
    await request(app).post("/api/v1/users").send({
      name: "example",
      email: "example@example.com",
      password: "password",
    });

    const responseSessions = await request(app).post("/api/v1/sessions").send({
      email: "example@example.com",
      password: "password",
    });

    const { token } = responseSessions.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("created_at");
    expect(response.body).toHaveProperty("updated_at");
    expect(response.body.name).toEqual("example");
    expect(response.body.email).toEqual("example@example.com");
  });
});

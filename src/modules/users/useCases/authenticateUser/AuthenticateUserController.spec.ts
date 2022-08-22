import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection("localhost");
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate an user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "example",
      email: "example@example.com",
      password: "password",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "example@example.com",
      password: "password",
    });

    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to authenticate an nonexistent user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "nonexistent@example.com",
      password: "password",
    });

    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty(
      "message",
      "Incorrect email or password"
    );
  });
  it("should not be able to authenticate with incorrect password", async () => {
    await request(app).post("/api/v1/users").send({
      name: "example",
      email: "example@example.com",
      password: "password",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "example@example.com",
      password: "incorrect",
    });

    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty(
      "message",
      "Incorrect email or password"
    );
  });
});

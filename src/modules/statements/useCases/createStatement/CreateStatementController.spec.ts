import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection("localhost");
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able create a statement an type deposit", async () => {
    await request(app).post("/api/v1/users").send({
      name: "user",
      email: "user@example.com",
      password: "password",
    });

    const responseAuth = await request(app).post("/api/v1/sessions").send({
      email: "user@example.com",
      password: "password",
    });

    const { token } = responseAuth.body;

    const responseStatement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "deposit test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseStatement.status).toEqual(201);
    expect(responseStatement.body).toHaveProperty("id");
  });

  it("should be able create a statement an type withdraw", async () => {
    await request(app).post("/api/v1/users").send({
      name: "user",
      email: "user@example.com",
      password: "password",
    });

    const responseAuth = await request(app).post("/api/v1/sessions").send({
      email: "user@example.com",
      password: "password",
    });

    const { token } = responseAuth.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "deposit test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const responseStatement = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "withdraw test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseStatement.status).toEqual(201);
    expect(responseStatement.body).toHaveProperty("id");
  });

  it("should not be able create statement type withdraw if insufficient funds", async () => {
    await request(app).post("/api/v1/users").send({
      name: "user",
      email: "user@example.com",
      password: "password",
    });

    const responseAuth = await request(app).post("/api/v1/sessions").send({
      email: "user@example.com",
      password: "password",
    });

    const { token } = responseAuth.body;

    const responseStatement = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 500,
        description: "withdraw test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseStatement.status).toEqual(400);
    expect(responseStatement.body).toHaveProperty(
      "message",
      "Insufficient funds"
    );
  });
});

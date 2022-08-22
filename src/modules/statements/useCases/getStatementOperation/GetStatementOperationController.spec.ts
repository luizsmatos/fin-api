import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;

describe("Get Statement Operation Controller", () => {
  const DEPOSIT_AMOUNT = 200;

  beforeAll(async () => {
    connection = await createConnection("localhost");
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get the statement operation", async () => {
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

    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: DEPOSIT_AMOUNT,
        description: "deposit test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const responseStatement = await request(app)
      .get(`/api/v1/statements/${responseDeposit.body.id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseStatement.status).toEqual(200);
    expect(responseStatement.body).toHaveProperty(
      "id",
      responseDeposit.body.id
    );
  });
});

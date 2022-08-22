import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;

describe("Get Balance Controller", () => {
  const DEPOSIT_AMOUNT = 200;
  const WITHDRAW_AMOUNT = 50.21;
  const BALANCE_AMOUNT = 149.79;

  beforeAll(async () => {
    connection = await createConnection("localhost");
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get the balance", async () => {
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
        amount: DEPOSIT_AMOUNT,
        description: "deposit test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: WITHDRAW_AMOUNT,
        description: "withdraw test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const responseBalance = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseBalance.status).toEqual(200);
    expect(responseBalance.body.statement).toHaveLength(2);
    expect(responseBalance.body.balance).toEqual(BALANCE_AMOUNT);
  });
});

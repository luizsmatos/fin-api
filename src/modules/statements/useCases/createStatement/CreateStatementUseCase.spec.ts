import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able create a statement an type deposit", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "user",
      email: "user@example.com",
      password: "password",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      amount: 200,
      description: "Deposit test",
      type: OperationType.DEPOSIT,
    });

    expect(statement).toHaveProperty("id");
    expect(statement.type).toEqual(OperationType.DEPOSIT);
  });

  it("should be able create a statement an type withdraw", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "user",
      email: "user@example.com",
      password: "password",
    });

    await createStatementUseCase.execute({
      user_id: user.id,
      amount: 200,
      description: "Deposit test",
      type: OperationType.DEPOSIT,
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      amount: 100.21,
      description: "Withdraw test",
      type: OperationType.WITHDRAW,
    });

    expect(statement).toHaveProperty("id");
    expect(statement.type).toBe(OperationType.WITHDRAW);
  });

  it("should not be able create statement a nonexistent user", async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: "1234",
        amount: 200,
        description: "Deposit test",
        type: OperationType.DEPOSIT,
      })
    ).rejects.toEqual(new CreateStatementError.UserNotFound());
  });

  it("should not be able create statement type withdraw if insufficient funds", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "user",
      email: "user@example.com",
      password: "password",
    });

    await expect(
      createStatementUseCase.execute({
        user_id: user.id,
        amount: 100.21,
        description: "Withdraw test error",
        type: OperationType.WITHDRAW,
      })
    ).rejects.toEqual(new CreateStatementError.InsufficientFunds());
  });
});

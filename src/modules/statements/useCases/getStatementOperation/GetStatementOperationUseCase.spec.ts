import { Statement } from "./../../entities/Statement";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get Statement Operation Use Case", () => {
  const DEPOSIT_AMOUNT = 100;

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to get the statement operation", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "user",
      email: "user@example.com",
      password: "password",
    });

    const statementDeposit = await inMemoryStatementsRepository.create({
      user_id: user.id,
      amount: DEPOSIT_AMOUNT,
      description: "deposit amount",
      type: OperationType.DEPOSIT,
    });

    const statement = await getStatementOperationUseCase.execute({
      user_id: user.id,
      statement_id: statementDeposit.id,
    });

    expect(statement).toBeInstanceOf(Statement);
  });

  it("should not be able to get the statement a nonexistent user", async () => {
    await expect(
      getStatementOperationUseCase.execute({
        user_id: "1234",
        statement_id: "321",
      })
    ).rejects.toEqual(new GetStatementOperationError.UserNotFound());
  });

  it("should not be able to get the statement a nonexistent", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "user",
      email: "user@example.com",
      password: "password",
    });

    await expect(
      getStatementOperationUseCase.execute({
        user_id: user.id,
        statement_id: "321",
      })
    ).rejects.toEqual(new GetStatementOperationError.StatementNotFound());
  });
});

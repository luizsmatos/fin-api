import { GetBalanceError } from "./GetBalanceError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get Balance Use Case", () => {
  const DEPOSIT_AMOUNT = 100;
  const WITHDRAW_AMOUNT = 88;
  const BALANCE_AMOUNT = 12;

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able to get the balance", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "user",
      email: "user@example.com",
      password: "password",
    });

    await inMemoryStatementsRepository.create({
      user_id: user.id,
      amount: DEPOSIT_AMOUNT,
      description: "deposit amount",
      type: OperationType.DEPOSIT,
    });

    await inMemoryStatementsRepository.create({
      user_id: user.id,
      amount: WITHDRAW_AMOUNT,
      description: "withdraw amount",
      type: OperationType.WITHDRAW,
    });

    const balance = await getBalanceUseCase.execute({ user_id: user.id });

    expect(balance.statement).toHaveLength(2);
    expect(balance.balance).toEqual(BALANCE_AMOUNT);
  });

  it("should not be able to get the balance a nonexistent user", async () => {
    await expect(
      getBalanceUseCase.execute({ user_id: "1234" })
    ).rejects.toEqual(new GetBalanceError());
  });
});

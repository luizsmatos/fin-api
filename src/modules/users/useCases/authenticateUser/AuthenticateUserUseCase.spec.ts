import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to authenticate an user", async () => {
    const user = await createUserUseCase.execute({
      name: "John",
      email: "john@example.com",
      password: "password",
    });

    const userAuthenticated = await authenticateUserUseCase.execute({
      email: user.email,
      password: "password",
    });

    expect(userAuthenticated).toHaveProperty("user");
    expect(userAuthenticated).toHaveProperty("token");
  });

  it("should not be able to authenticate an nonexistent user", async () => {
    await createUserUseCase.execute({
      name: "John",
      email: "john@example.com",
      password: "password",
    });

    const userAuthenticated = authenticateUserUseCase.execute({
      email: "user.email",
      password: "password",
    });

    await expect(userAuthenticated).rejects.toBeInstanceOf(
      IncorrectEmailOrPasswordError
    );
  });

  it("should not be able to authenticate with incorrect password", async () => {
    const user = await createUserUseCase.execute({
      name: "John",
      email: "john@example.com",
      password: "password",
    });

    const userAuthenticated = authenticateUserUseCase.execute({
      email: user.email,
      password: "pass",
    });

    await expect(userAuthenticated).rejects.toBeInstanceOf(
      IncorrectEmailOrPasswordError
    );
  });
});

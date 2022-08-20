import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "Luiz Gustavo",
      email: "teste@teste.com",
      password: "batatinha",
    });

    expect(user).toHaveProperty("id");
    expect(user.name).toEqual("Luiz Gustavo");
    expect(user.email).toEqual("teste@teste.com");
  });

  it("should not be able to create a user with an existent email", async () => {
    await createUserUseCase.execute({
      name: "Name First User",
      email: "user@email.com",
      password: "1234",
    });

    await expect(
      createUserUseCase.execute({
        name: "Name Second User",
        email: "user@email.com",
        password: "4321",
      })
    ).rejects.toBeInstanceOf(CreateUserError);
  });
});

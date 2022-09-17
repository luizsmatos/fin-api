import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from '../../entities/Statement';
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferError } from "./CreateTransferError";
import { ICreateTransferDTO } from "./ICreateTransferDTO";

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    userReceive_id,
    userSender_id,
    amount,
    description,
    type,
  }: ICreateTransferDTO) {
    const userSender = await this.usersRepository.findById(userSender_id);

    if (!userSender) {
      throw new CreateTransferError.UserNotFound();
    }

    const userReceive = await this.usersRepository.findById(userReceive_id);

    if (!userReceive) {
      throw new CreateTransferError.UserNotFound();
    }

    const userSenderBalance = await this.statementsRepository.getUserBalance({
      user_id: userSender_id,
    });

    if (userSenderBalance.balance < amount) {
      throw new CreateTransferError.InsufficientFunds();
    }

    await this.statementsRepository.create({
      user_id: userReceive_id,
      sender_id: userSender_id,
      amount,
      description: `Received transfer from ${userSender.name}: ${description}`,
      type,
    });

    const statementTransferOperation = await this.statementsRepository.create({
      user_id: userSender_id,
      amount,
      description: `Transfer to ${userReceive.name}: ${description}`,
      type: OperationType.WITHDRAW,
    });

    return statementTransferOperation;
  }
}

export { CreateTransferUseCase };

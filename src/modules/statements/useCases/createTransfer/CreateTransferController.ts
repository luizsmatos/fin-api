import { Request, Response } from "express";
import { container } from "tsyringe";
import { OperationType } from "../../entities/Statement";
import { CreateTransferError } from "./CreateTransferError";

import { CreateTransferUseCase } from "./CreateTransferUseCase";

class CreateTransferController {
  async execute(request: Request, response: Response) {
    const { id: userSender_id } = request.user;
    const { id: userReceive_id } = request.params;
    const { amount, description } = request.body;

    if (userReceive_id === userSender_id) {
      throw new CreateTransferError.UnableTransfer();
    }

    const createStatement = container.resolve(CreateTransferUseCase);

    const statement = await createStatement.execute({
      userSender_id,
      userReceive_id,
      amount,
      description,
      type: OperationType.TRANSFER,
    });

    return response.status(201).json(statement);
  }
}

export { CreateTransferController };

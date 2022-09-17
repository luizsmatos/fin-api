import { AppError } from "../../../../shared/errors/AppError";

export namespace CreateTransferError {
  export class UnableTransfer extends AppError {
    constructor() {
      super('Unable to transfer to your own account', 400);
    }
  }

  export class UserNotFound extends AppError {
    constructor() {
      super('User not found', 404);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super('Insufficient funds', 400);
    }
  }
}

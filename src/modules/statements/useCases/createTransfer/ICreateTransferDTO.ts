import { OperationType } from '../../entities/Statement';

interface ICreateTransferDTO {
  userReceive_id: string;
  userSender_id: string;
  amount: number;
  description: string;
  type: OperationType;
}

export { ICreateTransferDTO };

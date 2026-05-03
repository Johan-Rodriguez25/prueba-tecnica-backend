import type {
  Currency,
  TransactionStatus,
  TransactionType,
} from '../create-transaction/create-transaction.dto';

export type GetTransactionParams = {
  id: string;
};

export type GetTransactionOutput = {
  id: string;
  merchantId: string;
  amount: string;
  currency: Currency;
  type: TransactionType;
  status: TransactionStatus;
  reference: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

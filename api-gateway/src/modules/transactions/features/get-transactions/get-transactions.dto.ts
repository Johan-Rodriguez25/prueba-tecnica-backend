import type {
  Currency,
  TransactionStatus,
  TransactionType,
} from '../create-transaction/create-transaction.dto';

export type GetTransactionsQuery = {
  status?: TransactionStatus;
  type?: TransactionType;
  date_from?: string;
  date_to?: string;
  page?: string;
  limit?: string;
};

export type TransactionListItemOutput = {
  id: string;
  merchantId: string;
  amount: string;
  currency: Currency;
  type: TransactionType;
  status: TransactionStatus;
  reference: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type GetTransactionsMetaOutput = {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

export type GetTransactionsOutput = {
  data: TransactionListItemOutput[];
  meta: GetTransactionsMetaOutput;
};

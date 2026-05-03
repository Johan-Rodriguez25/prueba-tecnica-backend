export type Currency = "GTQ" | "COP" | "USD";

export type TransactionType = "payin" | "payout";

export type TransactionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "failed"
  | "completed";

export type CreateTransactionInput = {
  merchantId: string;
  amount: string;
  currency: Currency;
  type: TransactionType;
  metadata?: Record<string, unknown>;
};

export type CreateTransactionOutput = {
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


import type {
  Currency,
  TransactionStatus,
  TransactionType,
} from "../../../transactions/features/create-transaction/create-transaction.dto";
import type { SettlementStatus } from "../generate-settlement/generate-settlement.dto";

export type GetSettlementDetailsParams = {
  id: string;
};

export type SettlementTransactionItemOutput = {
  id: string;
  merchant_id: string;
  amount: string;
  currency: Currency;
  type: TransactionType;
  status: TransactionStatus;
  reference: string;
  metadata?: Record<string, unknown>;
  created_at: string;
};

export type GetSettlementDetailsOutput = {
  id: string;
  merchant_id: string;
  total_amount: string;
  transaction_count: number;
  status: SettlementStatus;
  period_start: string;
  period_end: string;
  transactions: SettlementTransactionItemOutput[];
};


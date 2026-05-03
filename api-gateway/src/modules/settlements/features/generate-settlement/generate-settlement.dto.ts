export type SettlementStatus = "pending" | "processed" | "paid";

export type GenerateSettlementInput = {
  merchant_id: string;
  period_start: string;
  period_end: string;
};

export type GenerateSettlementOutput = {
  id: string;
  merchant_id: string;
  total_amount: string;
  transaction_count: number;
  status: SettlementStatus;
  period_start: string;
  period_end: string;
  transaction_ids: string[];
};


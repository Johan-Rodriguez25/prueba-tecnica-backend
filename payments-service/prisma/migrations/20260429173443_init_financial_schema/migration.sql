-- CreateEnum
CREATE TYPE "MerchantStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('GTQ', 'COP', 'USD');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('payin', 'payout');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'approved', 'rejected', 'failed', 'completed');

-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('pending', 'processed', 'paid');

-- CreateTable
CREATE TABLE "Merchant" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "status" "MerchantStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" UUID NOT NULL,
    "merchant_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" "Currency" NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "reference" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settlement" (
    "id" UUID NOT NULL,
    "merchant_id" UUID NOT NULL,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "transaction_count" INTEGER NOT NULL,
    "status" "SettlementStatus" NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettlementTransaction" (
    "settlement_id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,

    CONSTRAINT "SettlementTransaction_pkey" PRIMARY KEY ("settlement_id","transaction_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_email_key" ON "Merchant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_api_key_key" ON "Merchant"("api_key");

-- CreateIndex
CREATE INDEX "Merchant_status_idx" ON "Merchant"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_reference_key" ON "Transaction"("reference");

-- CreateIndex
CREATE INDEX "Transaction_merchant_id_idx" ON "Transaction"("merchant_id");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_created_at_idx" ON "Transaction"("created_at");

-- CreateIndex
CREATE INDEX "Transaction_merchant_id_status_created_at_idx" ON "Transaction"("merchant_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "Settlement_merchant_id_idx" ON "Settlement"("merchant_id");

-- CreateIndex
CREATE INDEX "Settlement_status_idx" ON "Settlement"("status");

-- CreateIndex
CREATE INDEX "Settlement_period_start_period_end_idx" ON "Settlement"("period_start", "period_end");

-- CreateIndex
CREATE UNIQUE INDEX "SettlementTransaction_transaction_id_key" ON "SettlementTransaction"("transaction_id");

-- CreateIndex
CREATE INDEX "SettlementTransaction_settlement_id_idx" ON "SettlementTransaction"("settlement_id");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementTransaction" ADD CONSTRAINT "SettlementTransaction_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "Settlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementTransaction" ADD CONSTRAINT "SettlementTransaction_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

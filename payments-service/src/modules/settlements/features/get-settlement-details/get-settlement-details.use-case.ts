import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  GetSettlementDetailsOutput,
  GetSettlementDetailsParams,
} from './get-settlement-details.dto';

@Injectable()
export class GetSettlementDetailsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    params: GetSettlementDetailsParams,
  ): Promise<GetSettlementDetailsOutput> {
    const id = params.id.trim();

    const settlement = await this.prisma.settlement.findUnique({
      where: { id },
      select: {
        id: true,
        merchant_id: true,
        total_amount: true,
        transaction_count: true,
        status: true,
        period_start: true,
        period_end: true,
        transactions: {
          select: {
            transaction: {
              select: {
                id: true,
                merchant_id: true,
                amount: true,
                currency: true,
                type: true,
                status: true,
                reference: true,
                metadata: true,
                created_at: true,
              },
            },
          },
        },
      },
    });

    if (!settlement) {
      throw new NotFoundException('settlement not found');
    }

    return {
      id: settlement.id,
      merchant_id: settlement.merchant_id,
      total_amount: settlement.total_amount.toString(),
      transaction_count: settlement.transaction_count,
      status: settlement.status,
      period_start: settlement.period_start.toISOString(),
      period_end: settlement.period_end.toISOString(),
      transactions: settlement.transactions.map((row) => ({
        id: row.transaction.id,
        merchant_id: row.transaction.merchant_id,
        amount: row.transaction.amount.toString(),
        currency: row.transaction.currency,
        type: row.transaction.type,
        status: row.transaction.status,
        reference: row.transaction.reference,
        metadata:
          (row.transaction.metadata as Record<string, unknown> | null) ??
          undefined,
        created_at: row.transaction.created_at.toISOString(),
      })),
    };
  }
}

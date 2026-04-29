import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  GetTransactionInput,
  GetTransactionOutput,
} from './get-transaction.dto';

@Injectable()
export class GetTransactionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: GetTransactionInput): Promise<GetTransactionOutput> {
    const id = input.id.trim();

    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
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
        updated_at: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('transaction not found');
    }

    return {
      id: transaction.id,
      merchantId: transaction.merchant_id,
      amount: transaction.amount.toString(),
      currency: transaction.currency,
      type: transaction.type,
      status: transaction.status,
      reference: transaction.reference,
      metadata:
        (transaction.metadata as Record<string, unknown> | null) ?? undefined,
      createdAt: transaction.created_at,
      updatedAt: transaction.updated_at,
    };
  }
}

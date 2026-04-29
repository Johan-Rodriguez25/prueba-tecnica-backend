import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma, TransactionStatus } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateTransactionInput,
  CreateTransactionOutput,
} from './create-transaction.dto';

@Injectable()
export class CreateTransactionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    input: CreateTransactionInput,
  ): Promise<CreateTransactionOutput> {
    const merchantId = input.merchantId?.trim();
    const reference = input.reference?.trim();

    if (!merchantId) {
      throw new BadRequestException('merchantId is required');
    }

    if (!reference) {
      throw new BadRequestException('reference is required');
    }

    const amount = this.parseAmount(input.amount);
    if (amount.lte(0)) {
      throw new BadRequestException('amount must be greater than 0');
    }

    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { id: true, status: true },
    });
    if (!merchant) {
      throw new BadRequestException('merchant does not exist');
    }

    if (merchant.status !== 'active') {
      throw new BadRequestException('merchant is inactive');
    }

    const existing = await this.prisma.transaction.findUnique({
      where: { reference },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('transaction reference already exists');
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        merchant_id: merchantId,
        amount,
        currency: input.currency,
        type: input.type,
        status: TransactionStatus.pending,
        reference,
        metadata: input.metadata
          ? (input.metadata as Prisma.InputJsonValue)
          : undefined,
      },
    });

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

  private parseAmount(value: string): Prisma.Decimal {
    const normalized = value?.trim();
    if (!normalized) {
      throw new BadRequestException('amount is required');
    }

    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
      throw new BadRequestException(
        'amount must be a decimal with up to 2 decimals',
      );
    }

    return new Prisma.Decimal(normalized);
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import {
  GetTransactionsInput,
  GetTransactionsOutput,
} from './get-transactions.dto';

@Injectable()
export class GetTransactionsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: GetTransactionsInput): Promise<GetTransactionsOutput> {
    const page = Math.max(1, Math.trunc(input.page ?? 1));
    const pageSize = Math.min(
      100,
      Math.max(1, Math.trunc(input.pageSize ?? 20)),
    );
    const skip = (page - 1) * pageSize;

    const where: Prisma.TransactionWhereInput = {};

    const merchantId = input.merchantId?.trim();
    if (merchantId) {
      where.merchant_id = merchantId;
    }

    if (input.status) {
      where.status = input.status;
    }

    if (input.type) {
      where.type = input.type;
    }

    if (input.currency) {
      where.currency = input.currency;
    }

    const reference = input.reference?.trim();
    if (reference) {
      where.reference = { contains: reference, mode: 'insensitive' };
    }

    const createdFrom = this.parseDate(input.createdFrom, 'createdFrom');
    const createdTo = this.parseDate(input.createdTo, 'createdTo');
    if (createdFrom || createdTo) {
      where.created_at = {};
      if (createdFrom) where.created_at.gte = createdFrom;
      if (createdTo) where.created_at.lte = createdTo;
    }

    const minAmount = this.parseDecimal(input.minAmount, 'minAmount');
    const maxAmount = this.parseDecimal(input.maxAmount, 'maxAmount');
    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount.gte = minAmount;
      if (maxAmount) where.amount.lte = maxAmount;
    }

    if (minAmount && maxAmount && minAmount.gt(maxAmount)) {
      throw new BadRequestException(
        'minAmount cannot be greater than maxAmount',
      );
    }

    if (createdFrom && createdTo && createdFrom > createdTo) {
      throw new BadRequestException(
        'createdFrom cannot be greater than createdTo',
      );
    }

    const [total, transactions] = await this.prisma.$transaction([
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: pageSize,
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
      }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

    return {
      items: transactions.map((t) => ({
        id: t.id,
        merchantId: t.merchant_id,
        amount: t.amount.toString(),
        currency: t.currency,
        type: t.type,
        status: t.status,
        reference: t.reference,
        metadata: (t.metadata as Record<string, unknown> | null) ?? undefined,
        createdAt: t.created_at.toISOString(),
      })),
      page,
      pageSize,
      total,
      totalPages,
    };
  }

  private parseDate(
    value: string | undefined,
    fieldName: string,
  ): Date | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${fieldName} is invalid`);
    }
    return date;
  }

  private parseDecimal(
    value: string | undefined,
    fieldName: string,
  ): Prisma.Decimal | undefined {
    if (!value) return undefined;
    const normalized = value.trim();
    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
      throw new BadRequestException(
        `${fieldName} must be a decimal with up to 2 decimals`,
      );
    }
    return new Prisma.Decimal(normalized);
  }
}

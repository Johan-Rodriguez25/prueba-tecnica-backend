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

  async execute(
    input: GetTransactionsInput,
    merchantId: string,
  ): Promise<GetTransactionsOutput> {
    const page = Math.max(1, Math.trunc(input.page ?? 1));
    const limit = Math.min(100, Math.max(1, Math.trunc(input.limit ?? 20)));
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {
      merchant_id: merchantId,
    };

    if (input.status) {
      where.status = input.status;
    }

    if (input.type) {
      where.type = input.type;
    }

    const dateFrom = this.parseDate(input.date_from, 'date_from');
    const dateTo = this.parseDate(input.date_to, 'date_to');
    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) where.created_at.gte = dateFrom;
      if (dateTo) where.created_at.lte = dateTo;
    }

    if (dateFrom && dateTo && dateFrom > dateTo) {
      throw new BadRequestException('date_from cannot be greater than date_to');
    }

    const total = await this.prisma.transaction.count({ where });
    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
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
    });

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data: transactions.map((t) => ({
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
      meta: {
        total,
        page,
        limit,
        total_pages: totalPages,
      },
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
}

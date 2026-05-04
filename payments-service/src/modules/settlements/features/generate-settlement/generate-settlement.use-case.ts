import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, SettlementStatus, TransactionStatus } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import {
  GenerateSettlementInput,
  GenerateSettlementOutput,
} from './generate-settlement.dto';

@Injectable()
export class GenerateSettlementUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    input: GenerateSettlementInput,
  ): Promise<GenerateSettlementOutput> {
    const merchantId = input.merchant_id.trim();
    const periodStart = this.parseRangeStart(
      input.period_start,
      'period_start',
    );
    const periodEnd = this.parseRangeEnd(input.period_end, 'period_end');

    if (periodStart > periodEnd) {
      throw new BadRequestException(
        'period_start cannot be greater than period_end',
      );
    }

    try {
      const merchant = await this.prisma.merchant.findUnique({
        where: { id: merchantId },
        select: { id: true },
      });

      if (!merchant) {
        throw new BadRequestException('merchant_id does not exist');
      }

      const eligible = await this.prisma.transaction.findMany({
        where: {
          merchant_id: merchantId,
          status: TransactionStatus.approved,
          updated_at: {
            gte: periodStart,
            lte: periodEnd,
          },
          settlement_transaction: {
            is: null,
          },
        },
        select: {
          id: true,
          amount: true,
        },
      });

      if (eligible.length === 0) {
        const counts = await this.prisma.transaction.groupBy({
          by: ['status'],
          where: {
            merchant_id: merchantId,
            updated_at: { gte: periodStart, lte: periodEnd },
          },
          _count: { _all: true },
        });

        const approvedInRange = counts.find(
          (c) => c.status === TransactionStatus.approved,
        )?._count._all;

        const approvedAlreadySettled = await this.prisma.transaction.count({
          where: {
            merchant_id: merchantId,
            status: TransactionStatus.approved,
            updated_at: { gte: periodStart, lte: periodEnd },
            settlement_transaction: { isNot: null },
          },
        });

        throw new NotFoundException(
          [
            'No hay transacciones elegibles (approved) para liquidar en el rango indicado',
            `merchant_id=${merchantId}`,
            `period_start=${periodStart.toISOString()}`,
            `period_end=${periodEnd.toISOString()}`,
            `approved_in_range=${approvedInRange ?? 0}`,
            `approved_already_settled_in_range=${approvedAlreadySettled}`,
            `statuses_in_range=${JSON.stringify(counts)}`,
          ].join(' | '),
        );
      }

      const transactionIds = eligible.map((t) => t.id);

      const totalAmount = eligible.reduce(
        (acc, t) => acc.plus(t.amount),
        new Prisma.Decimal(0),
      );

      const settlement = await this.prisma.settlement.create({
        data: {
          merchant_id: merchantId,
          total_amount: totalAmount,
          transaction_count: eligible.length,
          status: SettlementStatus.pending,
          period_start: periodStart,
          period_end: periodEnd,
          transactions: {
            createMany: {
              data: transactionIds.map((transactionId) => ({
                transaction_id: transactionId,
              })),
            },
          },
        },
      });

      return GenerateSettlementOutput.fromPrisma({
        settlement,
        transactionIds,
      });
    } catch (error: unknown) {
      if (this.isPrismaUniqueConstraintError(error)) {
        throw new ConflictException(
          'No se pudo generar la liquidacion: una o mas transacciones ya pertenecen a otra liquidacion',
        );
      }
      throw error;
    }
  }

  private parseRangeStart(value: string, fieldName: string): Date {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const date = new Date(`${trimmed}T00:00:00.000Z`);
      if (Number.isNaN(date.getTime())) {
        throw new BadRequestException(`${fieldName} is invalid`);
      }
      return date;
    }

    const normalized = this.normalizeTimezone(trimmed);
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${fieldName} is invalid`);
    }
    return date;
  }

  private parseRangeEnd(value: string, fieldName: string): Date {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const date = new Date(`${trimmed}T23:59:59.999Z`);
      if (Number.isNaN(date.getTime())) {
        throw new BadRequestException(`${fieldName} is invalid`);
      }
      return date;
    }

    const normalized = this.normalizeTimezone(trimmed);
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${fieldName} is invalid`);
    }
    return date;
  }

  private normalizeTimezone(value: string): string {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/.test(value)) {
      return `${value}Z`;
    }
    return value;
  }

  private isPrismaUniqueConstraintError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    if (!('code' in error)) return false;
    return (error as { code: string }).code === 'P2002';
  }
}

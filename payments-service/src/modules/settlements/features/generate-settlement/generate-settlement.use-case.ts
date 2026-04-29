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
    const periodStart = this.parseDate(input.period_start, 'period_start');
    const periodEnd = this.parseDate(input.period_end, 'period_end');

    if (periodStart > periodEnd) {
      throw new BadRequestException(
        'period_start cannot be greater than period_end',
      );
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const merchant = await tx.merchant.findUnique({
          where: { id: merchantId },
          select: { id: true },
        });

        if (!merchant) {
          throw new BadRequestException('merchant_id does not exist');
        }

        const eligible = await tx.transaction.findMany({
          where: {
            merchant_id: merchantId,
            status: TransactionStatus.approved,
            created_at: {
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
          throw new NotFoundException(
            'No hay transacciones elegibles (approved) para liquidar en el rango indicado',
          );
        }

        const transactionIds = eligible.map((t) => t.id);

        const totalAmount = eligible.reduce(
          (acc, t) => acc.plus(t.amount),
          new Prisma.Decimal(0),
        );

        const settlement = await tx.settlement.create({
          data: {
            merchant_id: merchantId,
            total_amount: totalAmount,
            transaction_count: eligible.length,
            status: SettlementStatus.pending,
            period_start: periodStart,
            period_end: periodEnd,
          },
        });

        await tx.settlementTransaction.createMany({
          data: transactionIds.map((transactionId) => ({
            settlement_id: settlement.id,
            transaction_id: transactionId,
          })),
        });

        return GenerateSettlementOutput.fromPrisma({
          settlement,
          transactionIds,
        });
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

  private parseDate(value: string, fieldName: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${fieldName} is invalid`);
    }
    return date;
  }

  private isPrismaUniqueConstraintError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    if (!('code' in error)) return false;
    return (error as { code: string }).code === 'P2002';
  }
}

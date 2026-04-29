import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma, TransactionStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
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

    if (!merchantId) {
      throw new BadRequestException('merchantId is required');
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

    for (let attempt = 0; attempt < 5; attempt++) {
      const reference = this.generateReference(new Date());

      try {
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
            (transaction.metadata as Record<string, unknown> | null) ??
            undefined,
          createdAt: transaction.created_at,
          updatedAt: transaction.updated_at,
        };
      } catch (error: unknown) {
        if (this.isPrismaUniqueConstraintError(error)) {
          if (attempt === 4) {
            throw new ConflictException(
              'could not generate a unique transaction reference',
            );
          }
          continue;
        }
        throw error;
      }
    }

    throw new ConflictException('could not create transaction');
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

  private generateReference(now: Date): string {
    const dateStamp = this.formatDateStamp(now);
    const random = this.randomAlphaNumeric(6);
    return `TXN-${dateStamp}-${random}`;
  }

  private formatDateStamp(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  private randomAlphaNumeric(length: number): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bytes = randomBytes(length);
    let out = '';
    for (const b of bytes) {
      out += alphabet[b % alphabet.length];
    }
    return out;
  }

  private isPrismaUniqueConstraintError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    if (!('code' in error)) return false;
    return (error as { code: string }).code === 'P2002';
  }
}

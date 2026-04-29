import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import {
  UpdateTransactionStatusBody,
  UpdateTransactionStatusOutput,
  UpdateTransactionStatusParams,
} from './update-transaction-status.dto';

@Injectable()
export class UpdateTransactionStatusUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    params: UpdateTransactionStatusParams,
    body: UpdateTransactionStatusBody,
    merchantId: string,
  ): Promise<UpdateTransactionStatusOutput> {
    const id = params.id.trim();

    const transaction = await this.prisma.transaction.findFirst({
      where: { id, merchant_id: merchantId },
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

    const nextStatus = body.status;
    const currentStatus = transaction.status;

    if (!this.isValidTransition(currentStatus, nextStatus)) {
      throw new UnprocessableEntityException(
        `Transicion de estado invalida: no se puede cambiar de '${currentStatus}' a '${nextStatus}'`,
      );
    }

    if (currentStatus === nextStatus) {
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

    const updated = await this.prisma.transaction.update({
      where: { id },
      data: { status: nextStatus },
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

    return {
      id: updated.id,
      merchantId: updated.merchant_id,
      amount: updated.amount.toString(),
      currency: updated.currency,
      type: updated.type,
      status: updated.status,
      reference: updated.reference,
      metadata:
        (updated.metadata as Record<string, unknown> | null) ?? undefined,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    };
  }

  private isValidTransition(
    current: TransactionStatus,
    next: TransactionStatus,
  ): boolean {
    if (current === next) return true;

    if (current === TransactionStatus.pending) {
      return (
        next === TransactionStatus.approved ||
        next === TransactionStatus.rejected ||
        next === TransactionStatus.failed
      );
    }

    if (current === TransactionStatus.approved) {
      return (
        next === TransactionStatus.completed ||
        next === TransactionStatus.failed
      );
    }

    return false;
  }
}

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

export type TransactionStatusChangedEvent = {
  transactionId: string;
  merchantId: string;
  reference: string;
  previousStatus: string;
  currentStatus: string;
  occurredAt: string;
  payload: Record<string, unknown>;
};

@Injectable()
export class RecordNotificationFromEventUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(event: TransactionStatusChangedEvent): Promise<void> {
    const eventType = this.toEventType(event);

    await this.prisma.notification.create({
      data: {
        transaction_id: event.transactionId,
        merchant_id: event.merchantId,
        event_type: eventType,
        payload: event as unknown as Prisma.InputJsonValue,
      },
    });
  }

  private toEventType(event: TransactionStatusChangedEvent): string {
    const suffix = event.currentStatus?.trim();
    if (!suffix) return 'transaction.status_changed';
    return `transaction.${suffix}`;
  }
}

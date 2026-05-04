import { Inject, Injectable } from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

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
export class NotificationsEventsPublisher {
  constructor(
    @Inject('NOTIFICATIONS_CLIENT') private readonly client: ClientProxy,
  ) {}

  async transactionStatusChanged(
    event: TransactionStatusChangedEvent,
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.client.emit('transaction.status_changed', event),
      );
    } catch {
      return;
    }
  }
}

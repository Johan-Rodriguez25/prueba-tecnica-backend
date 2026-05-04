import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { RecordNotificationFromEventUseCase } from './record-notification-from-event.use-case';
import type { TransactionStatusChangedEvent } from './record-notification-from-event.use-case';

@Controller()
export class TransactionStatusChangedEventsController {
  constructor(
    private readonly recordNotificationFromEventUseCase: RecordNotificationFromEventUseCase,
  ) {}

  @EventPattern('transaction.status_changed')
  async handle(@Payload() event: TransactionStatusChangedEvent): Promise<void> {
    await this.recordNotificationFromEventUseCase.execute(event);
  }
}

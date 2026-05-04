import { Module } from '@nestjs/common';
import { GetNotificationController } from './features/get-notification/get-notification.controller';
import { GetNotificationUseCase } from './features/get-notification/get-notification.use-case';
import { GetNotificationsController } from './features/get-notifications/get-notifications.controller';
import { GetNotificationsUseCase } from './features/get-notifications/get-notifications.use-case';
import { TransactionStatusChangedEventsController } from './microservices/transaction-status-changed-events.controller';
import { RecordNotificationFromEventUseCase } from './microservices/record-notification-from-event.use-case';

@Module({
  controllers: [
    GetNotificationsController,
    GetNotificationController,
    TransactionStatusChangedEventsController,
  ],
  providers: [
    GetNotificationsUseCase,
    GetNotificationUseCase,
    RecordNotificationFromEventUseCase,
  ],
})
export class NotificationsModule {}

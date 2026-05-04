import { Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { NotificationsEventsPublisher } from './notifications-events.publisher';

@Module({
  providers: [
    {
      provide: 'NOTIFICATIONS_CLIENT',
      useFactory: () =>
        ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: process.env.NOTIFICATION_EVENTS_HOST ?? 'notification-service',
            port: Number(process.env.NOTIFICATION_EVENTS_PORT ?? 4000),
          },
        }),
    },
    NotificationsEventsPublisher,
  ],
  exports: [NotificationsEventsPublisher],
})
export class NotificationsModule {}


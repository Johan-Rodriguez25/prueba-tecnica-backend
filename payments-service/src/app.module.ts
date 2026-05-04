import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { SettlementsModule } from './modules/settlements/settlements.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    TransactionsModule,
    SettlementsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

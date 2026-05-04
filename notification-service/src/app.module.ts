import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}

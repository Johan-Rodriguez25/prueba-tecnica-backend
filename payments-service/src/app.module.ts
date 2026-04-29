import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { SettlementsModule } from './modules/settlements/settlements.module';
import { TransactionsModule } from './modules/transactions/transactions.module';

@Module({
  imports: [PrismaModule, TransactionsModule, SettlementsModule],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { NotificationsModule } from '@/notifications/notifications.module';
import { CreateTransactionController } from './features/create-transaction/create-transaction.controller';
import { CreateTransactionUseCase } from './features/create-transaction/create-transaction.use-case';
import { GetTransactionController } from './features/get-transaction/get-transaction.controller';
import { GetTransactionUseCase } from './features/get-transaction/get-transaction.use-case';
import { GetTransactionsController } from './features/get-transactions/get-transactions.controller';
import { GetTransactionsUseCase } from './features/get-transactions/get-transactions.use-case';
import { UpdateTransactionStatusController } from './features/update-transaction-status/update-transaction-status.controller';
import { UpdateTransactionStatusUseCase } from './features/update-transaction-status/update-transaction-status.use-case';

@Module({
  imports: [NotificationsModule],
  controllers: [
    CreateTransactionController,
    GetTransactionsController,
    GetTransactionController,
    UpdateTransactionStatusController,
  ],
  providers: [
    CreateTransactionUseCase,
    GetTransactionsUseCase,
    GetTransactionUseCase,
    UpdateTransactionStatusUseCase,
  ],
  exports: [
    CreateTransactionUseCase,
    GetTransactionsUseCase,
    GetTransactionUseCase,
    UpdateTransactionStatusUseCase,
  ],
})
export class TransactionsModule {}

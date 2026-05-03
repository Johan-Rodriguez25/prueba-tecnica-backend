import { Router } from 'express';
import { CreateTransactionController } from './features/create-transaction/create-transaction.controller';
import { CreateTransactionUseCase } from './features/create-transaction/create-transaction.use-case';
import { GetTransactionController } from './features/get-transaction/get-transaction.controller';
import { GetTransactionUseCase } from './features/get-transaction/get-transaction.use-case';
import { GetTransactionsController } from './features/get-transactions/get-transactions.controller';
import { GetTransactionsUseCase } from './features/get-transactions/get-transactions.use-case';
import { UpdateTransactionStatusController } from './features/update-transaction-status/update-transaction-status.controller';
import { UpdateTransactionStatusUseCase } from './features/update-transaction-status/update-transaction-status.use-case';

export function createTransactionsRouter(): Router {
  const router = Router();

  const createTransactionController = new CreateTransactionController(
    new CreateTransactionUseCase(),
  );
  const getTransactionController = new GetTransactionController(
    new GetTransactionUseCase(),
  );
  const getTransactionsController = new GetTransactionsController(
    new GetTransactionsUseCase(),
  );
  const updateTransactionStatusController =
    new UpdateTransactionStatusController(new UpdateTransactionStatusUseCase());

  router.post('/', async (req, res) =>
    createTransactionController.handle(req, res),
  );
  router.get('/', async (req, res) =>
    getTransactionsController.handle(req, res),
  );
  router.get('/:id', async (req, res) =>
    getTransactionController.handle(req, res),
  );
  router.patch('/:id/status', async (req, res) =>
    updateTransactionStatusController.handle(req, res),
  );

  return router;
}

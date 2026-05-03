import { Router } from 'express';
import { GenerateSettlementController } from './features/generate-settlement/generate-settlement.controller';
import { GenerateSettlementUseCase } from './features/generate-settlement/generate-settlement.use-case';
import { GetSettlementDetailsController } from './features/get-settlement-details/get-settlement-details.controller';
import { GetSettlementDetailsUseCase } from './features/get-settlement-details/get-settlement-details.use-case';

export function createSettlementsRouter(): Router {
  const router = Router();

  const generateSettlementController = new GenerateSettlementController(
    new GenerateSettlementUseCase(),
  );
  const getSettlementDetailsController = new GetSettlementDetailsController(
    new GetSettlementDetailsUseCase(),
  );

  router.post('/generate', async (req, res) =>
    generateSettlementController.handle(req, res),
  );
  router.get('/:id', async (req, res) =>
    getSettlementDetailsController.handle(req, res),
  );

  return router;
}

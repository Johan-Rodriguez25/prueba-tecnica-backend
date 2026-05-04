import type { Request, Response } from 'express';
import { GetTransactionsUseCase } from './get-transactions.use-case';
import { CircuitBreakerOpenError } from '../../../main/resilience/circuit-breaker';

export class GetTransactionsController {
  constructor(
    private readonly getTransactionsUseCase: GetTransactionsUseCase,
  ) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.getTransactionsUseCase.execute({
        query: req.query as unknown as Record<string, unknown>,
        headers: req.headers,
        auth: req.auth,
      });

      if (result.contentType) {
        res.setHeader('content-type', result.contentType);
      }

      if (typeof result.data === 'string') {
        res.status(result.status).send(result.data);
        return;
      }

      res.status(result.status).json(result.data);
    } catch (error) {
      if (error instanceof CircuitBreakerOpenError) {
        res.status(503).json({ message: 'payment-service unavailable' });
        return;
      }
      const isAbortError =
        error instanceof Error && error.name === 'AbortError';
      res.status(isAbortError ? 504 : 502).json({
        message: isAbortError
          ? 'payment-service timeout'
          : 'payment-service unavailable',
      });
    }
  }
}

import type { Request, Response } from 'express';
import type { CreateTransactionInput } from './create-transaction.dto';
import { CreateTransactionUseCase } from './create-transaction.use-case';
import { CircuitBreakerOpenError } from '../../../main/resilience/circuit-breaker';

export class CreateTransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
  ) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.createTransactionUseCase.execute({
        body: req.body as CreateTransactionInput,
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

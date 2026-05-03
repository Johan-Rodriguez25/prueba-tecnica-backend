import type { Request, Response } from 'express';
import type { GetTransactionParams } from './get-transaction.dto';
import { GetTransactionUseCase } from './get-transaction.use-case';

export class GetTransactionController {
  constructor(private readonly getTransactionUseCase: GetTransactionUseCase) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const params = req.params as unknown as GetTransactionParams;
      const result = await this.getTransactionUseCase.execute({
        id: params.id,
        headers: req.headers,
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

import type { Request, Response } from "express";
import type { GenerateSettlementInput } from "./generate-settlement.dto";
import { GenerateSettlementUseCase } from "./generate-settlement.use-case";

export class GenerateSettlementController {
  constructor(private readonly generateSettlementUseCase: GenerateSettlementUseCase) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.generateSettlementUseCase.execute({
        body: req.body as GenerateSettlementInput,
        headers: req.headers,
        auth: req.auth,
      });

      if (result.contentType) {
        res.setHeader("content-type", result.contentType);
      }

      if (typeof result.data === "string") {
        res.status(result.status).send(result.data);
        return;
      }

      res.status(result.status).json(result.data);
    } catch (error) {
      const isAbortError = error instanceof Error && error.name === "AbortError";
      res.status(isAbortError ? 504 : 502).json({
        message: isAbortError ? "payment-service timeout" : "payment-service unavailable",
      });
    }
  }
}

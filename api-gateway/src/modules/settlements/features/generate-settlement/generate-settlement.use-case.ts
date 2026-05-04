import type { IncomingHttpHeaders } from 'http';
import type {
  GenerateSettlementInput,
  GenerateSettlementOutput,
} from './generate-settlement.dto';
import type { AuthContext } from '../../../main/middlewares/dual-auth.middleware';
import { getCircuitBreaker } from '../../../main/resilience/circuit-breaker';

type ProxyResult<T> = {
  status: number;
  contentType: string | null;
  data: T | string;
};

const paymentServiceCircuitBreaker = getCircuitBreaker('payment-service');

function getHeaderValue(
  headers: IncomingHttpHeaders,
  name: string,
): string | undefined {
  const value = headers[name.toLowerCase()];
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

function pickForwardHeaders(
  headers: IncomingHttpHeaders,
  auth?: AuthContext,
): Record<string, string> {
  const forwarded: Record<string, string> = {};

  const apiKey = getHeaderValue(headers, 'x-api-key');
  const authApiKey =
    auth?.type === 'apiKey'
      ? auth.apiKey
      : auth?.type === 'jwt'
        ? auth.apiKey
        : undefined;
  if (apiKey) forwarded['x-api-key'] = apiKey;
  else if (authApiKey) forwarded['x-api-key'] = authApiKey;

  const authorization = getHeaderValue(headers, 'authorization');
  if (authorization) forwarded['authorization'] = authorization;

  const contentType = getHeaderValue(headers, 'content-type');
  if (contentType) forwarded['content-type'] = contentType;

  if (!forwarded['content-type'])
    forwarded['content-type'] = 'application/json';

  return forwarded;
}

async function readResponseBody(
  response: Response,
): Promise<{ contentType: string | null; data: unknown | string }> {
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return { contentType, data: (await response.json()) as unknown };
  }
  return { contentType, data: await response.text() };
}

export class GenerateSettlementUseCase {
  private readonly paymentServiceBaseUrl: string;
  private readonly timeoutMs: number;

  constructor(args?: { paymentServiceBaseUrl?: string; timeoutMs?: number }) {
    this.paymentServiceBaseUrl =
      args?.paymentServiceBaseUrl ??
      process.env.PAYMENT_SERVICE_URL ??
      'http://localhost:3000';
    const baseTimeoutMs = Number(
      process.env.PAYMENT_SERVICE_TIMEOUT_MS ?? 8000,
    );
    const settlementTimeoutMs = Number(
      process.env.PAYMENT_SERVICE_SETTLEMENT_TIMEOUT_MS ?? baseTimeoutMs,
    );

    const effectiveTimeoutMs = Number.isFinite(settlementTimeoutMs)
      ? settlementTimeoutMs
      : baseTimeoutMs;

    this.timeoutMs = args?.timeoutMs ?? effectiveTimeoutMs;
  }

  async execute(args: {
    body: GenerateSettlementInput;
    headers: IncomingHttpHeaders;
    auth?: AuthContext;
  }): Promise<ProxyResult<GenerateSettlementOutput>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      return await paymentServiceCircuitBreaker.execute(
        async () => {
          const response = await fetch(
            `${this.paymentServiceBaseUrl}/api/v1/settlements/generate`,
            {
              method: 'POST',
              headers: pickForwardHeaders(args.headers, args.auth),
              body: JSON.stringify(args.body),
              signal: controller.signal,
            },
          );

          const { contentType, data } = await readResponseBody(response);
          return {
            status: response.status,
            contentType,
            data: data as GenerateSettlementOutput,
          };
        },
        {
          isFailure: (result) => result.status >= 500,
        },
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}

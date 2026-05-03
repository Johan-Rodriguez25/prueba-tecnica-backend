import type { IncomingHttpHeaders } from 'http';
import type { GetTransactionOutput } from './get-transaction.dto';

type ProxyResult<T> = {
  status: number;
  contentType: string | null;
  data: T | string;
};

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
): Record<string, string> {
  const forwarded: Record<string, string> = {};

  const apiKey = getHeaderValue(headers, 'x-api-key');
  if (apiKey) forwarded['x-api-key'] = apiKey;

  const authorization = getHeaderValue(headers, 'authorization');
  if (authorization) forwarded['authorization'] = authorization;

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

export class GetTransactionUseCase {
  private readonly paymentServiceBaseUrl: string;
  private readonly timeoutMs: number;

  constructor(args?: { paymentServiceBaseUrl?: string; timeoutMs?: number }) {
    this.paymentServiceBaseUrl =
      args?.paymentServiceBaseUrl ??
      process.env.PAYMENT_SERVICE_URL ??
      'http://localhost:3001';
    this.timeoutMs =
      args?.timeoutMs ?? Number(process.env.PAYMENT_SERVICE_TIMEOUT_MS ?? 8000);
  }

  async execute(args: {
    id: string;
    headers: IncomingHttpHeaders;
  }): Promise<ProxyResult<GetTransactionOutput>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(
        `${this.paymentServiceBaseUrl}/api/v1/transactions/${args.id}`,
        {
          method: 'GET',
          headers: pickForwardHeaders(args.headers),
          signal: controller.signal,
        },
      );

      const { contentType, data } = await readResponseBody(response);
      return {
        status: response.status,
        contentType,
        data: data as GetTransactionOutput,
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

import type { IncomingHttpHeaders } from 'http';
import type { GetTransactionsOutput } from './get-transactions.dto';
import type { AuthContext } from '../../../main/middlewares/dual-auth.middleware';

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

  return forwarded;
}

function appendQueryParams(url: URL, query: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') {
      url.searchParams.set(key, value);
      continue;
    }
    if (Array.isArray(value)) {
      url.searchParams.delete(key);
      for (const item of value) {
        if (typeof item === 'string') url.searchParams.append(key, item);
      }
      continue;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      url.searchParams.set(key, String(value));
    }
  }
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

export class GetTransactionsUseCase {
  private readonly paymentServiceBaseUrl: string;
  private readonly timeoutMs: number;

  constructor(args?: { paymentServiceBaseUrl?: string; timeoutMs?: number }) {
    this.paymentServiceBaseUrl =
      args?.paymentServiceBaseUrl ??
      process.env.PAYMENT_SERVICE_URL ??
      'http://localhost:3000';
    this.timeoutMs =
      args?.timeoutMs ?? Number(process.env.PAYMENT_SERVICE_TIMEOUT_MS ?? 8000);
  }

  async execute(args: {
    query: Record<string, unknown>;
    headers: IncomingHttpHeaders;
    auth?: AuthContext;
  }): Promise<ProxyResult<GetTransactionsOutput>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const url = new URL('/api/v1/transactions', this.paymentServiceBaseUrl);
      appendQueryParams(url, args.query);

      const response = await fetch(url, {
        method: 'GET',
        headers: pickForwardHeaders(args.headers, args.auth),
        signal: controller.signal,
      });

      const { contentType, data } = await readResponseBody(response);
      return {
        status: response.status,
        contentType,
        data: data as GetTransactionsOutput,
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

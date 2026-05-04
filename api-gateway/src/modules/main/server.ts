import express, { Application } from 'express';
import type { IncomingHttpHeaders } from 'http';
import type { RequestHandler } from 'express';

import compression from 'compression';
import cors from 'cors';
import dotenvFlow from 'dotenv-flow';
import helmet from 'helmet';
import { createSettlementsRouter } from '../settlements/settlements.module';
import { createTransactionsRouter } from '../transactions/transactions.module';
import { dualAuthMiddleware } from './middlewares/dual-auth.middleware';
import { rateLimitByApiKeyMiddleware } from './middlewares/rate-limit.middleware';
import { requestLoggerMiddleware } from './middlewares/request-logger.middleware';
import { createSwaggerRouter } from './swagger/swagger';
import {
  CircuitBreakerOpenError,
  getCircuitBreaker,
} from './resilience/circuit-breaker';

dotenvFlow.config({
  silent: true,
});

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

function createNotificationsProxyRouter(): express.Router {
  const router = express.Router();

  const notificationServiceCircuitBreaker = getCircuitBreaker(
    'notification-service',
  );
  const notificationServiceBaseUrl =
    process.env.NOTIFICATION_SERVICE_URL ?? 'http://localhost:3002';
  const timeoutMs = Number(process.env.NOTIFICATION_SERVICE_TIMEOUT_MS ?? 8000);

  const proxyGet: RequestHandler = async (req, res) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const result = await notificationServiceCircuitBreaker.execute(
        async () => {
          const url = new URL(
            `/api/v1/notifications${req.path === '/' ? '' : req.path}`,
            notificationServiceBaseUrl,
          );
          appendQueryParams(url, req.query as Record<string, unknown>);

          const response = await fetch(url, {
            method: 'GET',
            headers: pickForwardHeaders(req.headers),
            signal: controller.signal,
          });

          const { contentType, data } = await readResponseBody(response);
          return { status: response.status, contentType, data };
        },
        {
          isFailure: (value) => value.status >= 500,
        },
      );

      if (result.contentType) res.setHeader('content-type', result.contentType);
      res.status(result.status).send(result.data);
    } catch (error) {
      if (error instanceof CircuitBreakerOpenError) {
        res.status(503).json({ message: 'notification-service unavailable' });
        return;
      }
      res.status(502).json({ message: 'notification-service unavailable' });
    } finally {
      clearTimeout(timeout);
    }
  };

  router.get('/', proxyGet);
  router.get('/:id', proxyGet);
  return router;
}

class Server {
  private port: number;
  public static instance: Server;
  public app: Application;
  private apiPath = {
    movies: '/v1/api/movies',
    uploadPoster: '/v1/api/upload/poster',
  };

  private constructor() {
    this.app = express();
    this.port = Number(process.env.PORT) || 3000;
    this.init();
  }

  public static getInstance(): Server {
    if (!Server.instance) {
      Server.instance = new Server();
    }

    return Server.instance;
  }

  private async init(): Promise<void> {
    try {
      this.listenStatusConnection();
    } catch (error) {
      console.log(error);
    }
  }

  private async listenStatusConnection() {
    try {
      this.middlewares();
      this.routes();
      this.listen();
    } catch (error) {
      throw new Error('El servidor no se pudo iniciar');
    }
  }

  private middlewares(): void {
    this.app.use(requestLoggerMiddleware());
    this.app.use(cors());
    this.app.use(
      express.urlencoded({
        limit: '6mb',
        extended: true,
        parameterLimit: 60000,
      }),
    );
    this.app.use(express.json({ limit: '6mb' }));
    this.app.use(helmet());
    this.app.use(compression({ level: 9 }));
  }

  private routes(): void {
    this.app.get('/', (req: any, res: any) =>
      res.status(200).json({ ok: true }),
    );

    this.app.get('/docs', (req, res) => res.redirect(301, '/api/docs'));
    this.app.get('/openapi.json', (req, res) =>
      res.redirect(301, '/api/openapi.json'),
    );
    this.app.use('/api', createSwaggerRouter());
    this.app.use(
      '/api/v1',
      dualAuthMiddleware(),
      rateLimitByApiKeyMiddleware(),
    );
    this.app.use('/api/v1/transactions', createTransactionsRouter());
    this.app.use('/api/v1/settlements', createSettlementsRouter());
    this.app.use('/api/v1/notifications', createNotificationsProxyRouter());
  }

  private listen(): void {
    this.app.listen(this.port, () => {
      console.log(`Servidor corriendo en ${this.port}`);
    });
  }
}

export default Server;

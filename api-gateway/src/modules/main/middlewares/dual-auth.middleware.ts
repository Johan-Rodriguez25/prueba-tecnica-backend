import crypto from 'crypto';
import type { RequestHandler } from 'express';

export type AuthContext =
  | { type: 'jwt'; payload: Record<string, unknown>; apiKey?: string }
  | { type: 'apiKey'; apiKey: string };

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

function base64UrlDecodeToString(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function verifyHs256Jwt(
  token: string,
  secret: string,
): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;
  const headerRaw = safeJsonParse(base64UrlDecodeToString(headerB64));
  const payloadRaw = safeJsonParse(base64UrlDecodeToString(payloadB64));

  if (!isRecord(headerRaw) || !isRecord(payloadRaw)) return null;
  if (headerRaw.alg !== 'HS256') return null;

  const unsigned = `${headerB64}.${payloadB64}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(unsigned)
    .digest('base64url');

  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(signatureB64);
  if (expectedBuffer.length !== actualBuffer.length) return null;

  const signatureMatches = crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  if (!signatureMatches) return null;

  const exp = payloadRaw.exp;
  if (typeof exp === 'number') {
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (nowSeconds >= exp) return null;
  }

  return payloadRaw;
}

function extractApiKeyFromJwtPayload(
  payload: Record<string, unknown>,
): string | undefined {
  const candidates = [
    payload.api_key,
    payload.apiKey,
    payload['x-api-key'],
    payload.x_api_key,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }
  return undefined;
}

export function dualAuthMiddleware(): RequestHandler {
  const secret = 'PRUEBA_TECNICA_SECRET_KEY';

  return (req, res, next) => {
    const authorization = req.header('authorization');
    if (authorization?.startsWith('Bearer ')) {
      const token = authorization.slice('Bearer '.length).trim();
      const payload = verifyHs256Jwt(token, secret);
      if (!payload) {
        res.status(401).json({ message: 'invalid token' });
        return;
      }
      req.auth = { type: 'jwt', payload, apiKey: extractApiKeyFromJwtPayload(payload) };
      next();
      return;
    }

    const apiKey = req.header('x-api-key');
    if (apiKey && apiKey.trim().length > 0) {
      req.auth = { type: 'apiKey', apiKey: apiKey.trim() };
      next();
      return;
    }

    res.status(401).json({ message: 'missing authorization' });
  };
}

import type { RequestHandler } from "express";
import type { AuthContext } from "./dual-auth.middleware";

type Counter = { count: number; resetAtMs: number };

class InMemoryRateLimiter {
  private readonly windowMs: number;
  private readonly limit: number;
  private readonly counters = new Map<string, Counter>();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(args: { windowMs: number; limit: number }) {
    this.windowMs = args.windowMs;
    this.limit = args.limit;
  }

  startCleanup(): void {
    if (this.cleanupTimer) return;

    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, counter] of this.counters.entries()) {
        if (counter.resetAtMs <= now) this.counters.delete(key);
      }
    }, this.windowMs);

    this.cleanupTimer.unref();
  }

  consume(key: string): { allowed: boolean; retryAfterSeconds: number } {
    const now = Date.now();
    const existing = this.counters.get(key);

    if (!existing || existing.resetAtMs <= now) {
      this.counters.set(key, { count: 1, resetAtMs: now + this.windowMs });
      return { allowed: true, retryAfterSeconds: 0 };
    }

    if (existing.count >= this.limit) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((existing.resetAtMs - now) / 1000),
      );
      return { allowed: false, retryAfterSeconds };
    }

    existing.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

const limiter = new InMemoryRateLimiter({ windowMs: 60_000, limit: 100 });
limiter.startCleanup();

export function rateLimitByApiKeyMiddleware(): RequestHandler {
  return (req, res, next) => {
    const auth = req.auth as AuthContext | undefined;
    if (!auth || auth.type !== "apiKey") {
      next();
      return;
    }

    const { allowed, retryAfterSeconds } = limiter.consume(auth.apiKey);
    if (!allowed) {
      res.setHeader("Retry-After", String(retryAfterSeconds));
      res.status(429).json({ message: "Too Many Requests" });
      return;
    }

    next();
  };
}


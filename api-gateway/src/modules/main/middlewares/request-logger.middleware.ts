import type { RequestHandler } from 'express';

export function requestLoggerMiddleware(): RequestHandler {
  return (req, res, next) => {
    const start = process.hrtime.bigint();

    res.on('finish', () => {
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1_000_000;
      const timestamp = new Date().toISOString();
      const method = req.method;
      const path = req.originalUrl || req.url;
      const statusCode = res.statusCode;
      const durationRounded = Math.round(durationMs);

      console.log(
        `[${timestamp}] ${method} ${path} ${statusCode} ${durationRounded}ms`,
      );
    });

    next();
  };
}

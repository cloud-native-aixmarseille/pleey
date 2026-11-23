import { createHash } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { ValkeyCaptchaStore } from '../../infrastructure/identity/captcha/valkey-captcha-store';

const WINDOW_MS = 60_000;
const PER_SOURCE_LIMIT = 600;
const DEPLOYMENT_LIMIT = 5_000;

export function createAnonymousAdmissionMiddleware(store: ValkeyCaptchaStore) {
  return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const source = request.ip || 'unknown';
    const sourceKey = createHash('sha256').update(source).digest('base64url');
    try {
      const [sourceCount, aggregateCount] = await Promise.all([
        store.increment(`anonymous-admission:source:${sourceKey}`, WINDOW_MS),
        store.increment('anonymous-admission:aggregate', WINDOW_MS),
      ]);
      if (sourceCount > PER_SOURCE_LIMIT || aggregateCount > DEPLOYMENT_LIMIT) {
        response
          .status(429)
          .setHeader('Retry-After', String(Math.ceil(WINDOW_MS / 1000)))
          .json({
            code: 'ANONYMOUS_ADMISSION_RATE_LIMITED',
          });
        return;
      }
      next();
    } catch {
      response.status(503).json({ code: 'ANONYMOUS_ADMISSION_UNAVAILABLE' });
    }
  };
}

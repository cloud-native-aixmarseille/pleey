import type { CaptchaAction } from '@pleey/contracts/identity';
import type { NextFunction, Request, Response } from 'express';
import type { CapCaptchaAdapter } from '../../infrastructure/identity/captcha/cap-captcha-adapter';

export function createBetterAuthCaptchaMiddleware(captcha: CapCaptchaAdapter, action: CaptchaAction) {
  return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const token = (request.body as { captchaToken?: unknown } | undefined)?.captchaToken;
    if (typeof token !== 'string' || token.length === 0) {
      response.status(400).json({ code: 'CAPTCHA_REQUIRED', message: 'Security check is required' });
      return;
    }
    try {
      await captcha.verify(action, token, request.ip ?? 'unknown');
      next();
    } catch {
      response.status(400).json({ code: 'CAPTCHA_INVALID', message: 'Security check is invalid' });
    }
  };
}

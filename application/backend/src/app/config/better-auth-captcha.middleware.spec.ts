import { CaptchaAction } from '@pleey/contracts/identity';
import { describe, expect, it, vi } from 'vitest';
import { createBetterAuthCaptchaMiddleware } from './better-auth-captcha.middleware';

describe('createBetterAuthCaptchaMiddleware', () => {
  it('verifies the action token before continuing the Better Auth request', async () => {
    // Arrange
    const captcha = { verify: vi.fn().mockResolvedValue(undefined) };
    const middleware = createBetterAuthCaptchaMiddleware(captcha as never, CaptchaAction.SIGNUP);
    const next = vi.fn();
    const response = { json: vi.fn(), status: vi.fn().mockReturnThis() };

    // Act
    await middleware({ body: { captchaToken: 'verified-token' }, ip: '203.0.113.4' } as never, response as never, next);

    // Assert
    expect(captcha.verify).toHaveBeenCalledWith(CaptchaAction.SIGNUP, 'verified-token', '203.0.113.4');
    expect(next).toHaveBeenCalledOnce();
    expect(response.status).not.toHaveBeenCalled();
  });

  it.each([
    [undefined, 'CAPTCHA_REQUIRED'],
    ['forged-token', 'CAPTCHA_INVALID'],
  ])('rejects an unusable captcha token %s', async (token, code) => {
    // Arrange
    const captcha = {
      verify: vi.fn().mockRejectedValue(new Error('invalid')),
    };
    const middleware = createBetterAuthCaptchaMiddleware(captcha as never, CaptchaAction.PASSWORD_RECOVERY);
    const next = vi.fn();
    const response = { json: vi.fn(), status: vi.fn().mockReturnThis() };

    // Act
    await middleware(
      { body: token === undefined ? {} : { captchaToken: token }, ip: '203.0.113.4' } as never,
      response as never,
      next,
    );

    // Assert
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ code }));
    expect(next).not.toHaveBeenCalled();
  });
});

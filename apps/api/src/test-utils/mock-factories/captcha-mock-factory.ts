import { type Mocked, vi } from 'vitest';
import type { CaptchaPort } from '../../application/identity/captcha/ports/captcha.port';

export class CaptchaMockFactory {
  create(): Mocked<CaptchaPort> {
    return {
      challenge: vi.fn(),
      redeem: vi.fn(),
      verify: vi.fn().mockResolvedValue(undefined),
    };
  }
}

import { createHash, createHmac } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import type {
  CaptchaChallenge,
  CaptchaPort,
  CaptchaProof,
  CaptchaRedemption,
} from '../../../application/identity/captcha/ports/captcha.port';
import type { CaptchaAction } from '../../../domain/identity/enums/captcha-action.enum';
import { CaptchaInvalidError } from '../../../domain/identity/errors/captcha-invalid.error';
import { CaptchaRateLimitedError } from '../../../domain/identity/errors/captcha-rate-limited.error';
import { CaptchaUnavailableError } from '../../../domain/identity/errors/captcha-unavailable.error';
import { isDomainError } from '../../../domain/shared/errors/domain-error';
import { CAPTCHA_CONFIG, type CaptchaConfig } from './captcha-config.token';
import { ValkeyCaptchaStore } from './valkey-captcha-store';

const CHALLENGE_TTL_MS = 2 * 60 * 1000;
const TOKEN_TTL_MS = 5 * 60 * 1000;
const TOKEN_PATTERN = /^[a-f0-9]{16}:[a-f0-9]{30}$/;

@Injectable()
export class CapCaptchaAdapter implements CaptchaPort {
  constructor(
    @Inject(CAPTCHA_CONFIG) private readonly config: CaptchaConfig,
    private readonly store: ValkeyCaptchaStore,
  ) {}

  async challenge(action: CaptchaAction, peer: string): Promise<CaptchaChallenge> {
    try {
      await this.limit(action, peer, 'challenge', 30, 60_000);
      // Native import preserves compatibility with capjs-core's ESM exports in the CommonJS backend.
      const { generateChallenge } = await import('capjs-core');
      const challenge = await generateChallenge(this.config.secret, {
        scope: action,
        challengeCount: 50,
        challengeSize: 32,
        challengeDifficulty: 4,
        expiresMs: CHALLENGE_TTL_MS,
        instrumentation: false,
      });
      if (!('challenge' in challenge)) throw new CaptchaUnavailableError({ operation: 'challenge' });
      return challenge;
    } catch (error) {
      this.rethrow(error, 'challenge');
    }
  }

  async redeem(action: CaptchaAction, proof: CaptchaProof, peer: string): Promise<CaptchaRedemption> {
    try {
      await this.limit(action, peer, 'redeem', 30, 60_000);
      const { validateChallenge } = await import('capjs-core');
      const result = await validateChallenge(this.config.secret, proof, {
        scope: action,
        tokenTtlMs: TOKEN_TTL_MS,
        consumeNonce: (signature, ttlMs) => this.store.consumeNonce(`captcha:nonce:${signature}`, ttlMs),
      });
      if (!result.success) {
        if (result.reason === 'nonce_store_error') throw new CaptchaUnavailableError({ operation: 'redeem' });
        throw new CaptchaInvalidError({ action, reason: result.reason });
      }
      await this.store.saveToken(this.tokenKey(result.token), action, result.expires - Date.now());
      return { success: true, token: result.token, expires: result.expires };
    } catch (error) {
      this.rethrow(error, 'redeem');
    }
  }

  async verify(action: CaptchaAction, token: string, peer: string): Promise<void> {
    try {
      await this.limit(action, peer, 'submit', 10, 10 * 60_000);
      if (typeof token !== 'string' || !TOKEN_PATTERN.test(token))
        throw new CaptchaInvalidError({ action, reason: 'invalid_token' });
      if (!(await this.store.consumeToken(this.tokenKey(token), action)))
        throw new CaptchaInvalidError({ action, reason: 'invalid_token' });
    } catch (error) {
      this.rethrow(error, 'verify');
    }
  }

  private tokenKey(token: string): string {
    return `captcha:token:${createHash('sha256').update(token).digest('hex')}`;
  }

  private async limit(
    action: CaptchaAction,
    peer: string,
    operation: string,
    maximum: number,
    windowMs: number,
  ): Promise<void> {
    const peerKey = createHmac('sha256', this.config.secret).update(peer).digest('hex');
    const count = await this.store.increment(`captcha:rate:${action}:${operation}:${peerKey}`, windowMs);
    if (count > maximum) throw new CaptchaRateLimitedError({ action, operation });
  }

  private rethrow(error: unknown, operation: string): never {
    if (isDomainError(error)) throw error;
    throw new CaptchaUnavailableError({ operation });
  }
}

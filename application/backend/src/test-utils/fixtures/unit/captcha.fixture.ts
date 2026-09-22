import { createHash } from 'node:crypto';
import type { CaptchaProof } from '../../../application/identity/captcha/ports/captcha.port';
import { CaptchaAction } from '../../../domain/identity/enums/captcha-action.enum';
import { CapCaptchaAdapter } from '../../../infrastructure/identity/captcha/cap-captcha-adapter';
import type { CaptchaConfig } from '../../../infrastructure/identity/captcha/captcha-config.token';

export class MemoryCaptchaStore {
  readonly entries = new Map<string, { value: string; expires: number }>();

  async increment(key: string, ttlMs: number): Promise<number> {
    const entry = this.read(key);
    const count = Number(entry?.value ?? '0') + 1;
    this.entries.set(key, { value: String(count), expires: entry?.expires ?? Date.now() + ttlMs });
    return count;
  }

  async consumeNonce(key: string, ttlMs: number): Promise<boolean> {
    if (this.read(key)) return false;
    this.entries.set(key, { value: '1', expires: Date.now() + ttlMs });
    return true;
  }

  async saveToken(key: string, action: string, ttlMs: number): Promise<void> {
    this.entries.set(key, { value: action, expires: Date.now() + ttlMs });
  }

  async consumeToken(key: string, action: string): Promise<boolean> {
    if (this.read(key)?.value !== action) return false;
    this.entries.delete(key);
    return true;
  }

  private read(key: string) {
    const entry = this.entries.get(key);
    return entry && entry.expires > Date.now() ? entry : undefined;
  }
}

export class CaptchaFixture {
  readonly config: CaptchaConfig = {
    secret: 'captcha_secret_at_least_32_bytes_for_tests',
    valkeyUrl: 'redis://localhost:6379',
  };
  readonly store = new MemoryCaptchaStore();
  readonly adapter = new CapCaptchaAdapter(this.config, this.store as never);
  readonly peer = '127.0.0.1';

  async proof(action = CaptchaAction.SIGNUP, expiresMs = 120_000, secret = this.config.secret): Promise<CaptchaProof> {
    const { generateChallenge } = await import('capjs-core');
    // Genuine signed SHA-256 proofs with small puzzle parameters keep unit tests fast.
    const challenge = await generateChallenge(secret, {
      scope: action,
      challengeCount: 2,
      challengeSize: 16,
      challengeDifficulty: 1,
      expiresMs,
      instrumentation: false,
    });
    if (!('challenge' in challenge)) throw new Error('Expected a format-1 challenge');
    const solutions = Array.from({ length: challenge.challenge.c }, (_, index) => {
      const salt = this.prng(challenge.token + (index + 1), challenge.challenge.s);
      const target = this.prng(`${challenge.token}${index + 1}d`, challenge.challenge.d);
      for (let nonce = 0; nonce < 100_000; nonce++) {
        if (
          createHash('sha256')
            .update(salt + nonce)
            .digest('hex')
            .startsWith(target)
        )
          return nonce;
      }
      throw new Error('Proof solver exhausted test bound');
    });
    return { token: challenge.token, solutions };
  }

  private prng(seed: string, length: number): string {
    // Cap's public format-1 derivation (FNV-1a then xorshift32), independently solved here.
    let state = 2166136261;
    for (let index = 0; index < seed.length; index++) state = Math.imul(state ^ seed.charCodeAt(index), 16777619) >>> 0;
    let output = '';
    while (output.length < length) {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      output += (state >>> 0).toString(16).padStart(8, '0');
    }
    return output.slice(0, length);
  }
}

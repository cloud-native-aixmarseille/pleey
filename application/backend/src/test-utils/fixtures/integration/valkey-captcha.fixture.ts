import { randomUUID } from 'node:crypto';
import { vi } from 'vitest';
import { ValkeyCaptchaStore } from '../../../infrastructure/identity/captcha/valkey-captcha-store';

export class ValkeyCaptchaFixture {
  readonly prefix = `captcha-test:${randomUUID()}`;
  readonly first: ValkeyCaptchaStore;
  readonly second: ValkeyCaptchaStore;

  constructor(url: string) {
    const config = { secret: 'captcha_secret_at_least_32_bytes_for_tests', valkeyUrl: url };
    this.first = new ValkeyCaptchaStore(config);
    this.second = new ValkeyCaptchaStore(config);
  }

  async start(): Promise<void> {
    this.first.onModuleInit();
    this.second.onModuleInit();
    await vi.waitFor(async () => {
      await this.first.increment(`${this.prefix}:ready-a`, 1000);
      await this.second.increment(`${this.prefix}:ready-b`, 1000);
    });
  }

  stop(): void {
    this.first.onModuleDestroy();
    this.second.onModuleDestroy();
  }
}

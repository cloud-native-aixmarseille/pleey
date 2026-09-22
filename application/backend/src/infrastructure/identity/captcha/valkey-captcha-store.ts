import { Inject, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';
import { CaptchaUnavailableError } from '../../../domain/identity/errors/captcha-unavailable.error';
import { CAPTCHA_CONFIG, type CaptchaConfig } from './captcha-config.token';

// Each mutation and its expiry are performed in one Valkey command across replicas.
const RATE_LIMIT_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
return count
`;
const CONSUME_TOKEN_SCRIPT = `
local action = redis.call('GET', KEYS[1])
if action ~= ARGV[1] then return 0 end
redis.call('DEL', KEYS[1])
return 1
`;

@Injectable()
export class ValkeyCaptchaStore implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ValkeyCaptchaStore.name);
  private readonly client;

  constructor(@Inject(CAPTCHA_CONFIG) config: CaptchaConfig) {
    this.client = createClient({
      url: config.valkeyUrl,
      disableOfflineQueue: true,
      commandsQueueMaxLength: 1000,
      socket: { connectTimeout: 3000, reconnectStrategy: (retries) => Math.min(250 * 2 ** retries, 5000) },
    });
    this.client.on('error', () => this.logger.warn('CAPTCHA storage is unavailable; verification is closed.'));
  }

  onModuleInit(): void {
    // Other authenticated features remain available during a Valkey outage.
    void this.client.connect().catch(() => this.logger.warn('CAPTCHA storage connection failed.'));
  }

  onModuleDestroy(): void {
    if (this.client.isOpen) this.client.destroy();
  }

  async increment(key: string, ttlMs: number): Promise<number> {
    return Number(await this.readyClient().eval(RATE_LIMIT_SCRIPT, { keys: [key], arguments: [String(ttlMs)] }));
  }

  async consumeNonce(key: string, ttlMs: number): Promise<boolean> {
    const result = await this.readyClient().set(key, '1', {
      condition: 'NX',
      expiration: { type: 'PX', value: Math.max(1, Math.ceil(ttlMs)) },
    });
    return result === 'OK';
  }

  async saveToken(key: string, action: string, ttlMs: number): Promise<void> {
    await this.readyClient().set(key, action, { expiration: { type: 'PX', value: Math.max(1, Math.ceil(ttlMs)) } });
  }

  async consumeToken(key: string, action: string): Promise<boolean> {
    return (await this.readyClient().eval(CONSUME_TOKEN_SCRIPT, { keys: [key], arguments: [action] })) === 1;
  }

  private readyClient() {
    if (!this.client.isReady) throw new CaptchaUnavailableError({ operation: 'storage' });
    return this.client.withAbortSignal(AbortSignal.timeout(3000));
  }
}

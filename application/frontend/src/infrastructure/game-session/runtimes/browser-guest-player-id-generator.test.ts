import { afterEach, describe, expect, it, vi } from 'vitest';
import { BrowserGuestPlayerIdGenerator } from './browser-guest-player-id-generator';

const originalCrypto = globalThis.crypto;
const dateNowSpy = vi.spyOn(Date, 'now');

describe('BrowserGuestPlayerIdGenerator', () => {
  afterEach(() => {
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: originalCrypto,
      writable: true,
    });
    dateNowSpy.mockReset();
  });

  it('uses crypto.randomUUID when it is available', () => {
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: {
        randomUUID: vi.fn(() => 'uuid-123'),
      } as unknown as Crypto,
      writable: true,
    });

    expect(new BrowserGuestPlayerIdGenerator().generate()).toBe('uuid-123');
  });

  it('falls back to a time-based guest id when randomUUID is unavailable', () => {
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: undefined,
      writable: true,
    });
    dateNowSpy.mockReturnValue(35);

    expect(new BrowserGuestPlayerIdGenerator().generate()).toBe('guest-z');
  });
});

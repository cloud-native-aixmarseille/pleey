import { describe, expect, it, vi } from 'vitest';
import { GuestPlayerIdentityService } from './guest-player-identity.service';

describe('GuestPlayerIdentityService', () => {
  it('reuses the restored guest id and sanitizes the nickname', () => {
    const service = new GuestPlayerIdentityService({
      generate: vi.fn(),
    });

    expect(
      service.resolveIdentity('  Trinity  ', {
        id: 'guest-123',
        nickname: 'Switch',
      }),
    ).toEqual({
      id: 'guest-123',
      nickname: 'Trinity',
    });
  });

  it('generates a new guest id when no identity is restored', () => {
    const generate = vi.fn(() => 'guest-999');
    const service = new GuestPlayerIdentityService({ generate });

    expect(service.resolveIdentity('Tank', null)).toEqual({
      id: 'guest-999',
      nickname: 'Tank',
    });
    expect(generate).toHaveBeenCalledTimes(1);
  });
});

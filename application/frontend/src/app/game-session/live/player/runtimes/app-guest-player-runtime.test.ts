import { describe, expect, it, vi } from 'vitest';
import { GuestPlayerIdentityService } from '../../../../../domains/game-session/services/guest-player-identity.service';
import { StorageKey } from '../../../../../domains/shared/value-objects/storage-key';
import { StoragePortMockFactory } from '../../../../../test-utils/factories/storage-port-mock-factory';
import { AppGuestPlayerRuntime } from './app-guest-player-runtime';

const storagePortMockFactory = new StoragePortMockFactory();

describe('AppGuestPlayerRuntime', () => {
  function createService(seed: Record<string, string> = {}) {
    return new AppGuestPlayerRuntime(
      storagePortMockFactory.create(seed),
      new GuestPlayerIdentityService({
        generate: vi.fn(() => 'guest-999'),
      }),
    );
  }

  it('restores a persisted guest identity', () => {
    const storage = storagePortMockFactory.create({
      [StorageKey.GAME_GUEST_ID]: 'guest-123',
      [StorageKey.GAME_GUEST_NICKNAME]: 'Switch',
    });
    const service = new AppGuestPlayerRuntime(
      storage,
      new GuestPlayerIdentityService({ generate: vi.fn() }),
    );

    expect(service.restore()).toEqual({
      id: 'guest-123',
      nickname: 'Switch',
    });
  });

  it('clears partial guest persistence when one of the fields is missing', () => {
    const storage = storagePortMockFactory.create({
      [StorageKey.GAME_GUEST_ID]: 'guest-123',
    });
    const service = new AppGuestPlayerRuntime(
      storage,
      new GuestPlayerIdentityService({ generate: vi.fn() }),
    );

    expect(service.restore()).toBeNull();
    expect(storage.removeItem).toHaveBeenCalledWith(StorageKey.GAME_GUEST_ID);
    expect(storage.removeItem).toHaveBeenCalledWith(StorageKey.GAME_GUEST_NICKNAME);
  });

  it('reuses the stored guest id when resolving an updated nickname', () => {
    const service = createService({
      [StorageKey.GAME_GUEST_ID]: 'guest-123',
      [StorageKey.GAME_GUEST_NICKNAME]: 'Switch',
    });

    expect(service.resolveIdentity('  Trinity  ')).toEqual({
      id: 'guest-123',
      nickname: 'Trinity',
    });
  });

  it('generates a new guest id through the domain service when no identity is restored', () => {
    const service = createService();

    expect(service.resolveIdentity('Tank')).toEqual({
      id: 'guest-999',
      nickname: 'Tank',
    });
  });

  it('persists the guest identity when remembered', () => {
    const storage = storagePortMockFactory.create();
    const service = new AppGuestPlayerRuntime(
      storage,
      new GuestPlayerIdentityService({ generate: vi.fn() }),
    );

    service.remember({
      id: 'guest-999',
      nickname: 'Tank',
    });

    expect(storage.setItem).toHaveBeenCalledWith(StorageKey.GAME_GUEST_ID, 'guest-999');
    expect(storage.setItem).toHaveBeenCalledWith(StorageKey.GAME_GUEST_NICKNAME, 'Tank');
  });
});

import { vi } from 'vitest';
import { JoinGameFlowService } from '../../domains/game-session/services/join-game-flow-service';
import type { GameJoinContextValue } from '../../presentation/game-session/live/shared/contexts/game-join-context';

export class GameJoinContextMockFactory {
  createValue(overrides: Partial<GameJoinContextValue> = {}): GameJoinContextValue {
    return {
      joinGameFlow: new JoinGameFlowService(),
      errorCode: null,
      guestNickname: '',
      isSubmitting: false,
      lastJoinRequest: null,
      clearError: vi.fn(),
      joinAsAuthenticated: vi.fn().mockResolvedValue(undefined),
      joinAsGuest: vi.fn().mockResolvedValue(undefined),
      ...overrides,
    };
  }

  createModule(overrides: Partial<GameJoinContextValue> = {}) {
    const value = this.createValue(overrides);

    return {
      useGameJoin: () => value,
    };
  }

  async createPartialModule<TModule extends object>(
    importOriginal: () => Promise<TModule>,
    overrides: Partial<GameJoinContextValue> = {},
  ): Promise<TModule & ReturnType<GameJoinContextMockFactory['createModule']>> {
    const actual = await importOriginal();

    return {
      ...actual,
      ...this.createModule(overrides),
    };
  }
}

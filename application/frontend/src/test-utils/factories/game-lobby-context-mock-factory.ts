import { vi } from 'vitest';
import type { GameLobbyContextValue } from '../../presentation/game-session/live/shared/contexts/game-lobby-context';

export class GameLobbyContextMockFactory {
  createValue(overrides: Partial<GameLobbyContextValue> = {}): GameLobbyContextValue {
    return {
      gameType: 'quiz',
      gameTitle: 'Arcade Trivia',
      sessionPin: 'AB12CD',
      players: [],
      hasReceivedRoster: true,
      hasGameStarted: false,
      isHost: false,
      errorCode: null,
      buildJoinUrl: (pin: string) => `http://localhost/game/join?pin=${encodeURIComponent(pin)}`,
      activateSession: vi.fn(),
      clearError: vi.fn(),
      startGame: vi.fn(),
      leaveSession: vi.fn().mockResolvedValue(undefined),
      ...overrides,
    };
  }
}

import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PresentationContextErrorCode } from '../../../../../domains/shared/errors/presentation-context-error-code';
import { GameLobbyProvider, useGameLobby } from './game-lobby-context';

describe('useGameLobby', () => {
  it('returns the provided lobby context value', () => {
    const value = {
      gameType: 'quiz' as const,
      gameTitle: 'Arcade Trivia',
      sessionPin: 'AB12CD',
      players: [],
      hasReceivedRoster: false,
      hasGameStarted: false,
      isHost: false,
      errorCode: null,
      buildJoinUrl: vi.fn((pin: string) => `/game/join?pin=${pin}`),
      activateSession: vi.fn(),
      clearError: vi.fn(),
      startGame: vi.fn(),
      leaveSession: vi.fn(),
    };

    const wrapper = ({ children }: { readonly children: ReactNode }) => (
      <GameLobbyProvider value={value}>{children}</GameLobbyProvider>
    );

    const { result } = renderHook(() => useGameLobby(), { wrapper });

    expect(result.current).toBe(value);
  });

  it('throws when the provider is missing', () => {
    expect(() => renderHook(() => useGameLobby())).toThrow(
      PresentationContextErrorCode.GAME_LOBBY_PROVIDER_REQUIRED,
    );
  });
});

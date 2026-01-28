import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PresentationContextErrorCode } from '../../../../../domains/shared/errors/presentation-context-error-code';
import type { GamePlayingContextValue } from './game-playing-context';
import { GamePlayingProvider, useGamePlaying } from './game-playing-context';

describe('useGamePlaying', () => {
  it('returns the provided playing context value', () => {
    const value: GamePlayingContextValue = {
      activePlayerCount: 0,
      actionResult: null,
      actionSubmitted: false,
      currentGameType: null,
      gameType: 'quiz',
      gameTitle: 'Arcade Trivia',
      currentStage: null,
      errorCode: null,
      hasGameEnded: false,
      isHost: false,
      isPaused: false,
      isResultTransitionActive: false,
      leaderboard: [],
      selectedActionId: null,
      sessionPin: 'AB12CD',
      timeLeft: null,
      totalStages: 0,
      activateSession: vi.fn(),
      clearError: vi.fn(),
      leaveSession: vi.fn().mockResolvedValue(undefined),
      submitAction: vi.fn(),
    };

    const wrapper = ({ children }: { readonly children: ReactNode }) => (
      <GamePlayingProvider value={value}>{children}</GamePlayingProvider>
    );

    const { result } = renderHook(() => useGamePlaying(), { wrapper });

    expect(result.current).toBe(value);
  });

  it('throws when the provider is missing', () => {
    expect(() => renderHook(() => useGamePlaying())).toThrow(
      PresentationContextErrorCode.GAME_PLAYING_PROVIDER_REQUIRED,
    );
  });
});

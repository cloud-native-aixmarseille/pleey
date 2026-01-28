import { renderHook } from '@testing-library/react';
import { type PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PresentationContextErrorCode } from '../../../../../domains/shared/errors/presentation-context-error-code';
import { GameHostControlProvider, useGameHostControl } from './game-host-control-context';

describe('game-host-control-context', () => {
  it('returns the provided host controls and flags', () => {
    const value = {
      isHost: true,
      isPaused: false,
      canRewindStage: true,
      canReturnToLobby: true,
      shouldReturnToLobbyFromCurrentStage: false,
      isEndConfirmPending: false,
      pauseGame: vi.fn(),
      resumeGame: vi.fn(),
      restartStage: vi.fn(),
      rewindStage: vi.fn(),
      returnToLobby: vi.fn(),
      nextStage: vi.fn(),
      requestEndGame: vi.fn(),
      confirmEndGame: vi.fn(),
      cancelEndGame: vi.fn(),
    };
    const wrapper = ({ children }: PropsWithChildren) => (
      <GameHostControlProvider value={value}>{children}</GameHostControlProvider>
    );

    const { result } = renderHook(() => useGameHostControl(), { wrapper });

    result.current.pauseGame();

    expect(result.current.isHost).toBe(true);
    expect(result.current.canRewindStage).toBe(true);
    expect(value.pauseGame).toHaveBeenCalledTimes(1);
  });

  it('throws when the hook is used without its provider', () => {
    expect(() => renderHook(() => useGameHostControl())).toThrow(
      PresentationContextErrorCode.GAME_PLAYING_PROVIDER_REQUIRED,
    );
  });
});

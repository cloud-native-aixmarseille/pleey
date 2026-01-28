import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameSessionParticipantRole } from '../../../../../domains/game-session/entities/active-game-session';

describe('useAppGamePlayingRuntimeState', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('provides host ownership for the synchronized session context', async () => {
    const getActiveHostSessionByPinUseCase = {
      execute: vi.fn().mockResolvedValue({
        sessionId: 12,
        gameId: 4,
        pin: 'AB12CD',
        status: 'ACTIVE',
        currentStageId: 2,
        participantRole: GameSessionParticipantRole.HOST,
        createdAt: '2026-04-09T10:00:00.000Z',
      }),
    };
    const { useAppGamePlayingRuntimeState } = await import('./use-app-game-playing-runtime-state');
    const { result } = renderHook(() =>
      useAppGamePlayingRuntimeState({
        hostOwnershipContext: { sessionPin: null, userId: 7 },
        getActiveHostSessionByPinUseCase: getActiveHostSessionByPinUseCase as never,
      }),
    );

    expect(result.current.isHost).toBe(false);

    act(() => {
      result.current.syncHostOwnershipContext({ sessionPin: 'AB12CD', userId: 7 });
    });

    await waitFor(() => {
      expect(getActiveHostSessionByPinUseCase.execute).toHaveBeenCalledWith('AB12CD');
      expect(result.current.isHost).toBe(true);
    });
  });
});

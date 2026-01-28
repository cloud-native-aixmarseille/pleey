import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { RuntimeContainerMockFactory } from 'src/test-utils/factories/runtime-container-mock-factory';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GAME_SERVICE_ID } from '../../../../../application/game-session/live/shared/contracts/game-session-service-id';
import { GameSessionParticipantRole } from '../../../../../domains/game-session/entities/active-game-session';

const mocks = vi.hoisted(() => ({
  assignLocation: vi.fn(),
  isHost: true,
  runtimeGet: vi.fn(),
}));

const runtimeContainerMockFactory = new RuntimeContainerMockFactory();

vi.mock('../../../../../presentation/identity/contexts/auth-context', async () => {
  const { AuthContextMockFactory } = await import(
    'src/test-utils/factories/auth-context-mock-factory'
  );

  return new AuthContextMockFactory().createPartialModule(
    () =>
      vi.importActual<typeof import('../../../../../presentation/identity/contexts/auth-context')>(
        '../../../../../presentation/identity/contexts/auth-context',
      ),
    {
      hasRestoredSession: true,
      isAuthenticated: true,
      user: {
        id: 7,
        username: 'Neo',
        email: 'neo@matrix.io',
      },
    },
  );
});

vi.mock(
  '../../../../../presentation/game-session/live/shared/contexts/game-playing-context',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('../../../../../presentation/game-session/live/shared/contexts/game-playing-context')
      >();

    return {
      ...actual,
      useGamePlaying: () => ({
        currentStage: null,
        isHost: mocks.isHost,
        isPaused: false,
        sessionPin: 'AB12CD',
        totalStages: 0,
        hasGameEnded: false,
      }),
    };
  },
);

vi.mock('../../../../composition/runtime-container', () =>
  runtimeContainerMockFactory.createModule((...args: unknown[]) => mocks.runtimeGet(...args)),
);

describe('AppGameHostControlProvider', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubGlobal('location', {
      ...globalThis.location,
      assign: mocks.assignLocation,
    });
  });

  async function renderProvider(
    sessions = [
      {
        sessionId: 12,
        gameId: 4,
        pin: 'AB12CD',
        status: 'ACTIVE',
        currentStageId: 2,
        participantRole: GameSessionParticipantRole.HOST,
        createdAt: '2026-04-09T10:00:00.000Z',
      },
    ],
    pollResponses: readonly unknown[] = [sessions],
  ) {
    const hostControlRuntime = {
      pauseGame: vi.fn(),
      resumeGame: vi.fn(),
      restartStage: vi.fn(),
      rewindStage: vi.fn(),
      returnToLobby: vi.fn(),
      nextStage: vi.fn(),
      endGame: vi.fn(),
    };
    let callCount = 0;
    const getActiveHostSessionByPinUseCase = {
      execute: vi.fn().mockImplementation(async () => {
        const response =
          callCount < pollResponses.length ? pollResponses[callCount] : (sessions[0] ?? null);
        callCount += 1;
        return Array.isArray(response) ? (response[0] ?? null) : response;
      }),
    };

    mocks.runtimeGet.mockImplementation((token: unknown) => {
      if (typeof token === 'function' && token.name === 'GetActiveHostSessionByPinUseCase') {
        return getActiveHostSessionByPinUseCase;
      }

      if (token === GAME_SERVICE_ID.gameHostControlRuntime) {
        return hostControlRuntime;
      }

      throw new Error(`Unexpected runtime token: ${String(token)}`);
    });

    const [{ AppGameHostControlProvider }, { useGameHostControl }] = await Promise.all([
      import('./app-game-host-control-provider'),
      import(
        '../../../../../presentation/game-session/live/host/contexts/game-host-control-context'
      ),
    ]);

    const wrapper = ({ children }: PropsWithChildren) => (
      <AppGameHostControlProvider>{children}</AppGameHostControlProvider>
    );

    const rendered = renderHook(() => useGameHostControl(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    return {
      hostControlRuntime,
      getActiveHostSessionByPinUseCase,
      ...rendered,
    };
  }

  it('navigates the host to the dashboard after ending the session', async () => {
    mocks.isHost = true;

    const activeSessions = [
      {
        sessionId: 12,
        gameId: 4,
        pin: 'AB12CD',
        status: 'ACTIVE',
        currentStageId: 2,
        participantRole: GameSessionParticipantRole.HOST,
        createdAt: '2026-04-09T10:00:00.000Z',
      },
    ];
    const { hostControlRuntime, getActiveHostSessionByPinUseCase, result } = await renderProvider(
      activeSessions,
      [activeSessions[0], null],
    );

    await waitFor(() => {
      expect(result.current.isHost).toBe(true);
    });

    await act(async () => {
      result.current.requestEndGame();
      result.current.confirmEndGame();
    });

    expect(hostControlRuntime.endGame).toHaveBeenCalledWith({ pin: 'AB12CD' });
    await waitFor(() => {
      expect(getActiveHostSessionByPinUseCase.execute).toHaveBeenCalledTimes(2);
      expect(mocks.assignLocation).toHaveBeenCalledWith('/workspace/dashboard');
    });
    expect(result.current.isEndConfirmPending).toBe(false);
  });

  it('does not expose host controls to authenticated players who do not own the session', async () => {
    mocks.isHost = false;

    const { hostControlRuntime, result } = await renderProvider([
      {
        sessionId: 99,
        gameId: 4,
        pin: 'ZX98YU',
        status: 'ACTIVE',
        currentStageId: 2,
        participantRole: GameSessionParticipantRole.HOST,
        createdAt: '2026-04-09T10:00:00.000Z',
      },
    ]);

    await waitFor(() => {
      expect(result.current.isHost).toBe(false);
    });

    act(() => {
      result.current.pauseGame();
    });

    expect(hostControlRuntime.pauseGame).not.toHaveBeenCalled();

    mocks.isHost = true;
  });
});

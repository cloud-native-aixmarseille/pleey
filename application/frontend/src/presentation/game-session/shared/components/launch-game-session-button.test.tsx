import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { GameSessionParticipantRole } from '../../../../domains/game-session/entities/active-game-session';
import { GameSessionStatus } from '../../../../domains/game-session/entities/game-session-status';
import { renderWithProviders } from '../../../../test-utils/render-with-providers';
import { LaunchGameSessionButton } from './launch-game-session-button';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  resolveLobbyRoute: vi.fn((pin: string) => `/live/${pin}/lobby`),
}));

vi.mock('src/presentation/shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

vi.mock('../../../shared/routing/router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../shared/routing/router')>();

  return {
    ...actual,
    usePresentationNavigate: () => mocks.navigate,
  };
});

vi.mock('../../../shared/routing/game-session-route-context', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../../shared/routing/game-session-route-context')>();

  return {
    ...actual,
    useGameSessionRoutes: () => ({
      resolveLobbyRoute: mocks.resolveLobbyRoute,
    }),
  };
});

vi.mock('../../../shared/ui/overlay/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('LaunchGameSessionButton', () => {
  it('disables launching when an active session already exists', async () => {
    renderWithProviders(
      <LaunchGameSessionButton
        createGameSession={vi.fn()}
        gameId={7}
        loadActiveSessions={vi.fn().mockResolvedValue([
          {
            sessionId: 1,
            gameId: 7,
            pin: 'ABCD12',
            status: GameSessionStatus.ACTIVE,
            currentStageId: null,
            participantRole: GameSessionParticipantRole.HOST,
            createdAt: '2026-04-02T10:00:00.000Z',
          },
        ])}
      />,
    );

    const button = await screen.findByRole('button', {
      name: 'dashboard.games.actions.launch',
    });

    await waitFor(() => expect(button).toBeDisabled());
  });

  it('creates a session and navigates to the lobby route', async () => {
    const user = userEvent.setup();
    const createGameSession = vi.fn().mockResolvedValue({
      sessionId: 9,
      gameId: 7,
      pin: 'ZXCV12',
      status: GameSessionStatus.WAITING,
      currentStageId: null,
      participantRole: GameSessionParticipantRole.HOST,
      createdAt: '2026-04-02T10:00:00.000Z',
    });

    renderWithProviders(
      <LaunchGameSessionButton
        createGameSession={createGameSession}
        gameId={7}
        loadActiveSessions={vi.fn().mockResolvedValue([])}
      />,
    );

    const button = await screen.findByRole('button', {
      name: 'dashboard.games.actions.launch',
    });

    await waitFor(() => expect(button).toBeEnabled());
    await user.click(button);

    expect(createGameSession).toHaveBeenCalledWith(7);
    expect(mocks.resolveLobbyRoute).toHaveBeenCalledWith('ZXCV12');
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith('/live/ZXCV12/lobby'));
  });
});

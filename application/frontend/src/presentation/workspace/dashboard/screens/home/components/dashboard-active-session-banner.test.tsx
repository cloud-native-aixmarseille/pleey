import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { GameSessionParticipantRole } from '../../../../../../domains/game-session/entities/active-game-session';
import { GameSessionStatus } from '../../../../../../domains/game-session/entities/game-session-status';
import { createGameTypeDescriptorFixture } from '../../../../../../test-utils/factories/game-type-descriptor-fixture-factory';
import { renderWithUiProvider } from '../../../../../../test-utils/render-with-ui-provider';
import { DashboardActiveSessionBanner } from './dashboard-active-session-banner';

vi.mock('../../../../../shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

describe('DashboardActiveSessionBanner', () => {
  function renderDashboardActiveSessionBanner(
    overrides: Partial<React.ComponentProps<typeof DashboardActiveSessionBanner>> = {},
  ) {
    const onOpenSession = vi.fn();
    const onResumeSession = vi.fn().mockResolvedValue(undefined);
    const onStopSession = vi.fn().mockResolvedValue(undefined);
    const session = {
      sessionId: 9,
      gameId: 15,
      pin: '4242',
      status: GameSessionStatus.ACTIVE,
      currentStageId: 4,
      participantRole: GameSessionParticipantRole.HOST,
      createdAt: '2026-03-20T00:00:00.000Z',
    };

    renderWithUiProvider(
      <DashboardActiveSessionBanner
        gameTypeDescriptor={createGameTypeDescriptorFixture({
          key: 'quiz',
          titleKey: 'gameType.quiz.title',
          iconKey: 'quiz',
        })}
        isActionPending={false}
        onOpenSession={onOpenSession}
        onResumeSession={onResumeSession}
        onStopSession={onStopSession}
        session={session}
        sessionGame={{
          gameId: 15,
          type: 'quiz',
          title: 'Arcade Finals',
          description: null,
          createdAt: '2026-03-19T00:00:00.000Z',
          relatedGameId: 15,
          stageCount: 0,
        }}
        {...overrides}
      />,
    );

    return { onOpenSession, onResumeSession, onStopSession, session };
  }

  it('renders active session details and forwards open and pause actions', async () => {
    const user = userEvent.setup();
    const { onOpenSession, onStopSession, session } = renderDashboardActiveSessionBanner();

    expect(screen.getByText('dashboard.sessions.status.active')).toBeInTheDocument();
    expect(screen.getByText('gameType.quiz.title')).toBeInTheDocument();
    expect(screen.getByText('Arcade Finals')).toBeInTheDocument();
    expect(screen.getByText('dashboard.sessions.pin (pin=4242)')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'dashboard.sessions.actions.openLive' }));
    await user.click(screen.getByRole('button', { name: 'dashboard.sessions.actions.pause' }));

    expect(onOpenSession).toHaveBeenCalledWith(session);
    expect(onStopSession).toHaveBeenCalledOnce();
  });

  it('shows the pending resume action when a paused session is being resumed', () => {
    renderDashboardActiveSessionBanner({
      isActionPending: true,
      session: {
        sessionId: 9,
        gameId: 15,
        pin: '4242',
        status: GameSessionStatus.PAUSED,
        currentStageId: 4,
        participantRole: GameSessionParticipantRole.HOST,
        createdAt: '2026-03-20T00:00:00.000Z',
      },
      sessionGame: null,
    });

    expect(screen.getByText('dashboard.sessions.fallbackTitle (pin=4242)')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'dashboard.sessions.actions.openLobby' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'dashboard.sessions.actions.resuming' }),
    ).toBeDisabled();
  });

  it('uses the lobby action label while a waiting session has not started', () => {
    renderDashboardActiveSessionBanner({
      session: {
        sessionId: 9,
        gameId: 15,
        pin: '4242',
        status: GameSessionStatus.WAITING,
        currentStageId: null,
        participantRole: GameSessionParticipantRole.HOST,
        createdAt: '2026-03-20T00:00:00.000Z',
      },
    });

    expect(
      screen.getByRole('button', { name: 'dashboard.sessions.actions.openLobby' }),
    ).toBeInTheDocument();
  });
});

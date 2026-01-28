import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { GameSessionParticipantRole } from '../../../../../../domains/game-session/entities/active-game-session';
import { GameSessionStatus } from '../../../../../../domains/game-session/entities/game-session-status';
import { renderWithProviders } from '../../../../../../test-utils/render-with-providers';
import { DashboardActiveSessionBannerActions } from './dashboard-active-session-banner-actions';

vi.mock('../../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('DashboardActiveSessionBannerActions', () => {
  it('opens the live session and pauses an active game', async () => {
    const user = userEvent.setup();
    const session = {
      sessionId: 1,
      gameId: 7,
      pin: 'ABCDE1',
      status: GameSessionStatus.ACTIVE,
      currentStageId: 2,
      participantRole: GameSessionParticipantRole.HOST,
      createdAt: '2026-04-02T10:00:00.000Z',
    };
    const onOpenSession = vi.fn();
    const onStopSession = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <DashboardActiveSessionBannerActions
        isActionPending={false}
        onOpenSession={onOpenSession}
        onResumeSession={vi.fn()}
        onStopSession={onStopSession}
        session={session}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'dashboard.sessions.actions.openLive' }));
    await user.click(screen.getByRole('button', { name: 'dashboard.sessions.actions.pause' }));

    expect(onOpenSession).toHaveBeenCalledWith(session);
    expect(onStopSession).toHaveBeenCalledTimes(1);
  });

  it('shows the lobby and resume actions for a paused session', async () => {
    const user = userEvent.setup();
    const onResumeSession = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <DashboardActiveSessionBannerActions
        isActionPending={false}
        onOpenSession={vi.fn()}
        onResumeSession={onResumeSession}
        onStopSession={vi.fn()}
        session={{
          sessionId: 2,
          gameId: 8,
          pin: 'FGHIJ2',
          status: GameSessionStatus.PAUSED,
          currentStageId: 3,
          participantRole: GameSessionParticipantRole.HOST,
          createdAt: '2026-04-02T10:00:00.000Z',
        }}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'dashboard.sessions.actions.openLobby' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'dashboard.sessions.actions.resume' }));

    expect(onResumeSession).toHaveBeenCalledTimes(1);
  });
});

import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HostPartyRuntimeCommand } from '../../../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import { renderWithUiProvider } from '../../../../../../../test-utils/render-with-ui-provider';
import { HostStartPartyAction } from './host-start-party-action';

vi.mock('../../../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('HostStartPartyAction', () => {
  it('renders the prominent start CTA and triggers the start handler when the lobby is ready', () => {
    const onStartParty = vi.fn();

    renderWithUiProvider(
      <HostStartPartyAction
        controls={{
          canAdvanceStage: false,
          canEndParty: true,
          canPauseParty: false,
          canRestartStage: false,
          canResumeParty: false,
          canRevealStageResult: false,
          canRewindParty: false,
          canRewindStage: false,
          canStartParty: true,
          currentStageNumber: null,
          hasNextStage: false,
          isPaused: false,
          lifecyclePhase: 'lobby',
          totalStages: null,
        }}
        onStartParty={onStartParty}
        pendingCommand={null}
      />,
    );

    expect(screen.getByText('game.party.host.route.runtimeLobbyHint')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'game.party.host.route.startPartyCta' }));

    expect(onStartParty).toHaveBeenCalledTimes(1);
  });

  it('hides the start CTA and shows the running phase once the party has started', () => {
    renderWithUiProvider(
      <HostStartPartyAction
        controls={{
          canAdvanceStage: true,
          canEndParty: true,
          canPauseParty: true,
          canRestartStage: true,
          canResumeParty: false,
          canRevealStageResult: false,
          canRewindParty: true,
          canRewindStage: true,
          canStartParty: false,
          currentStageNumber: 2,
          hasNextStage: true,
          isPaused: false,
          lifecyclePhase: 'result',
          totalStages: 4,
        }}
        onStartParty={vi.fn()}
        pendingCommand={null}
      />,
    );

    expect(
      screen.queryByRole('button', { name: 'game.party.host.route.startPartyCta' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('game.party.route.runtimeStageProgress (current=2, total=4)'),
    ).toBeInTheDocument();
  });

  it('disables the start CTA and shows the pending hint while a command is in flight', () => {
    renderWithUiProvider(
      <HostStartPartyAction
        controls={{
          canAdvanceStage: false,
          canEndParty: true,
          canPauseParty: false,
          canRestartStage: false,
          canResumeParty: false,
          canRevealStageResult: false,
          canRewindParty: false,
          canRewindStage: false,
          canStartParty: true,
          currentStageNumber: null,
          hasNextStage: false,
          isPaused: false,
          lifecyclePhase: 'lobby',
          totalStages: null,
        }}
        onStartParty={vi.fn()}
        pendingCommand={HostPartyRuntimeCommand.StartParty}
      />,
    );

    expect(screen.getByText('game.party.host.route.runtimePending')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'game.party.host.route.startPartyCta' }),
    ).toBeDisabled();
  });

  it('keeps the start CTA visible but disabled while the lobby has no players yet', () => {
    const onStartParty = vi.fn();

    renderWithUiProvider(
      <HostStartPartyAction
        controls={{
          canAdvanceStage: false,
          canEndParty: true,
          canPauseParty: false,
          canRestartStage: false,
          canResumeParty: false,
          canRevealStageResult: false,
          canRewindParty: false,
          canRewindStage: false,
          canStartParty: false,
          currentStageNumber: null,
          hasNextStage: false,
          isPaused: false,
          lifecyclePhase: 'lobby',
          totalStages: null,
        }}
        onStartParty={onStartParty}
        pendingCommand={null}
      />,
    );

    const startButton = screen.getByRole('button', { name: 'game.party.host.route.startPartyCta' });

    expect(startButton).toBeDisabled();
    expect(screen.getByText('game.party.host.route.runtimeLobbyHint')).toBeInTheDocument();

    fireEvent.click(startButton);

    expect(onStartParty).not.toHaveBeenCalled();
  });
});

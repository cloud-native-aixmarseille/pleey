import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HostPartyRuntimeCommand } from '../../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import { PartyRuntimePhase } from '../../../../../../domains/game/party/shared/entities/party-runtime-context';
import { ActionPermissionReason } from '../../../../../../domains/shared/value-objects/action-permission';
import { renderWithUiProvider } from '../../../../../../test-utils/render-with-ui-provider';
import { HostStartPartyAction } from './host-start-party-action';

vi.mock('../../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('HostStartPartyAction', () => {
  it('renders the prominent start CTA and triggers the start handler when the lobby is ready', () => {
    // Arrange
    const onStartParty = vi.fn();

    // Act
    renderWithUiProvider(
      <HostStartPartyAction
        controls={{
          permissions: {
            advanceStage: { allowed: false, reason: ActionPermissionReason.UNAVAILABLE },
            endParty: { allowed: true, reason: null },
            pauseParty: { allowed: false, reason: ActionPermissionReason.UNAVAILABLE },
            restartStage: { allowed: false, reason: ActionPermissionReason.UNAVAILABLE },
            resumeParty: { allowed: false, reason: ActionPermissionReason.UNAVAILABLE },
            revealStageResult: { allowed: false, reason: ActionPermissionReason.UNAVAILABLE },
            rewindParty: { allowed: false, reason: ActionPermissionReason.UNAVAILABLE },
            rewindStage: { allowed: false, reason: ActionPermissionReason.UNAVAILABLE },
            startParty: { allowed: true, reason: null },
          },
          currentStageNumber: null,
          hasNextStage: false,
          isPaused: false,
          lifecyclePhase: PartyRuntimePhase.LOBBY,
          totalStages: null,
        }}
        onStartParty={onStartParty}
        pendingCommand={null}
      />,
    );

    // Assert
    expect(screen.queryByText('game.party.host.route.runtimeLobbyHint')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'game.party.host.route.startPartyCta' }));

    expect(onStartParty).toHaveBeenCalledTimes(1);
  });

  it('renders nothing once the party has started', () => {
    // Arrange + Act
    renderWithUiProvider(
      <HostStartPartyAction
        controls={{
          permissions: {
            advanceStage: { allowed: true, reason: null },
            endParty: { allowed: true, reason: null },
            pauseParty: { allowed: true, reason: null },
            restartStage: { allowed: true, reason: null },
            resumeParty: { allowed: false, reason: ActionPermissionReason.UNAVAILABLE },
            revealStageResult: { allowed: false, reason: ActionPermissionReason.UNAVAILABLE },
            rewindParty: { allowed: true, reason: null },
            rewindStage: { allowed: true, reason: null },
            startParty: { allowed: false, reason: ActionPermissionReason.UNAVAILABLE },
          },
          currentStageNumber: 2,
          hasNextStage: true,
          isPaused: false,
          lifecyclePhase: PartyRuntimePhase.RESULT,
          totalStages: 4,
        }}
        onStartParty={vi.fn()}
        pendingCommand={null}
      />,
    );

    // Assert
    expect(screen.queryByRole('button', { name: 'game.party.host.route.startPartyCta' })).not.toBeInTheDocument();
    expect(screen.queryByText('game.party.host.route.runtimeLobbyHint')).not.toBeInTheDocument();
  });

  it('disables the start CTA and shows the pending hint while a command is in flight', () => {
    // Arrange + Act
    renderWithUiProvider(
      <HostStartPartyAction
        controls={{
          permissions: {
            advanceStage: { allowed: false, reason: ActionPermissionReason.UNAVAILABLE },
            endParty: { allowed: true, reason: null },
            pauseParty: { allowed: false, reason: ActionPermissionReason.UNAVAILABLE },
            restartStage: { allowed: false, reason: ActionPermissionReason.UNAVAILABLE },
            resumeParty: { allowed: false, reason: ActionPermissionReason.UNAVAILABLE },
            revealStageResult: { allowed: false, reason: ActionPermissionReason.UNAVAILABLE },
            rewindParty: { allowed: false, reason: ActionPermissionReason.UNAVAILABLE },
            rewindStage: { allowed: false, reason: ActionPermissionReason.UNAVAILABLE },
            startParty: { allowed: true, reason: null },
          },
          currentStageNumber: null,
          hasNextStage: false,
          isPaused: false,
          lifecyclePhase: PartyRuntimePhase.LOBBY,
          totalStages: null,
        }}
        onStartParty={vi.fn()}
        pendingCommand={HostPartyRuntimeCommand.StartParty}
      />,
    );

    // Assert
    expect(screen.getByText('game.party.host.route.runtimePending')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'game.party.host.route.startPartyCta' })).toBeDisabled();
  });

  it('keeps the start CTA visible but disabled while the lobby has no players yet', () => {
    // Arrange
    const onStartParty = vi.fn();

    renderWithUiProvider(
      <HostStartPartyAction
        controls={{
          permissions: {
            advanceStage: { allowed: false, reason: ActionPermissionReason.UNAVAILABLE },
            endParty: { allowed: true, reason: null },
            pauseParty: { allowed: false, reason: ActionPermissionReason.UNAVAILABLE },
            restartStage: { allowed: false, reason: ActionPermissionReason.UNAVAILABLE },
            resumeParty: { allowed: false, reason: ActionPermissionReason.UNAVAILABLE },
            revealStageResult: { allowed: false, reason: ActionPermissionReason.UNAVAILABLE },
            rewindParty: { allowed: false, reason: ActionPermissionReason.UNAVAILABLE },
            rewindStage: { allowed: false, reason: ActionPermissionReason.UNAVAILABLE },
            startParty: { allowed: false, reason: ActionPermissionReason.UNAVAILABLE },
          },
          currentStageNumber: null,
          hasNextStage: false,
          isPaused: false,
          lifecyclePhase: PartyRuntimePhase.LOBBY,
          totalStages: null,
        }}
        onStartParty={onStartParty}
        pendingCommand={null}
      />,
    );

    // Act
    const startButton = screen.getByRole('button', { name: 'game.party.host.route.startPartyCta' });

    // Assert
    expect(startButton).toBeDisabled();
    expect(screen.queryByText('game.party.host.route.runtimeLobbyHint')).not.toBeInTheDocument();

    fireEvent.click(startButton);

    expect(onStartParty).not.toHaveBeenCalled();
  });
});

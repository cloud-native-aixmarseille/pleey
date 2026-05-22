import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HostPartyRuntimeCommand } from '../../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import { PartyRuntimePhase } from '../../../../../../domains/game/party/shared/entities/party-runtime-context';
import { renderWithUiProvider } from '../../../../../../test-utils/render-with-ui-provider';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import { HostRuntimeCommandMenu } from './host-runtime-command-menu';

vi.mock('../../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

const handlers = {
  onAdvanceStage: vi.fn(),
  onPauseParty: vi.fn(),
  onRequestEndParty: vi.fn(),
  onRestartStage: vi.fn(),
  onResumeParty: vi.fn(),
  onRevealStageResult: vi.fn(),
  onRewindParty: vi.fn(),
  onRewindStage: vi.fn(),
};

describe('HostRuntimeCommandMenu', () => {
  it('opens the discrete menu and routes a click to the matching runtime handler', async () => {
    const onAdvanceStage = vi.fn();

    renderWithUiProvider(
      <HostRuntimeCommandMenu
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
          lifecyclePhase: PartyRuntimePhase.RESULT,
          totalStages: 4,
        }}
        {...handlers}
        onAdvanceStage={onAdvanceStage}
        pendingCommand={null}
      />,
    );

    const trigger = screen.getByRole('button', { name: /runtimeMenuTrigger/ });

    fireEvent.click(trigger);

    const advanceStageMenuItem = await screen.findByRole('menuitem', {
      name: 'game.party.host.route.advanceStageCta',
    });
    const dropdownId = trigger.getAttribute('aria-controls');
    const dropdown = dropdownId ? document.getElementById(dropdownId) : null;

    expect(dropdown).not.toBeNull();

    expect(dropdown).toHaveAttribute(
      'style',
      expect.stringContaining(
        `background: color-mix(in srgb, ${uiThemeTokens.color.surface.overlay} 76%, ${uiThemeTokens.color.surface.panel})`,
      ),
    );

    fireEvent.click(advanceStageMenuItem);

    expect(onAdvanceStage).toHaveBeenCalledTimes(1);
  });

  it('disables every menu item while a host command is pending', async () => {
    renderWithUiProvider(
      <HostRuntimeCommandMenu
        controls={{
          canAdvanceStage: true,
          canEndParty: true,
          canPauseParty: true,
          canRestartStage: true,
          canResumeParty: true,
          canRevealStageResult: true,
          canRewindParty: true,
          canRewindStage: true,
          canStartParty: false,
          currentStageNumber: 2,
          hasNextStage: true,
          isPaused: false,
          lifecyclePhase: PartyRuntimePhase.STAGE,
          totalStages: 4,
        }}
        {...handlers}
        pendingCommand={HostPartyRuntimeCommand.AdvanceStage}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /runtimeMenuTrigger/ }));

    const items = await screen.findAllByRole('menuitem');

    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item).toHaveAttribute('data-disabled');
    }
  });

  it('rebuilds the mounted menu items when the pending command clears', async () => {
    const view = renderWithUiProvider(
      <HostRuntimeCommandMenu
        controls={{
          canAdvanceStage: false,
          canEndParty: true,
          canPauseParty: false,
          canRestartStage: true,
          canResumeParty: true,
          canRevealStageResult: false,
          canRewindParty: true,
          canRewindStage: false,
          canStartParty: false,
          currentStageNumber: 1,
          hasNextStage: false,
          isPaused: true,
          lifecyclePhase: PartyRuntimePhase.STAGE,
          totalStages: 4,
        }}
        {...handlers}
        pendingCommand={HostPartyRuntimeCommand.RestartStage}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /runtimeMenuTrigger/ }));

    expect(
      await screen.findByRole('menuitem', { name: 'game.party.host.route.restartStageCta' }),
    ).toHaveAttribute('data-disabled');

    view.rerender(
      <HostRuntimeCommandMenu
        controls={{
          canAdvanceStage: false,
          canEndParty: true,
          canPauseParty: false,
          canRestartStage: true,
          canResumeParty: true,
          canRevealStageResult: false,
          canRewindParty: true,
          canRewindStage: false,
          canStartParty: false,
          currentStageNumber: 1,
          hasNextStage: false,
          isPaused: true,
          lifecyclePhase: PartyRuntimePhase.STAGE,
          totalStages: 4,
        }}
        {...handlers}
        pendingCommand={null}
      />,
    );

    expect(
      screen.getByRole('menuitem', {
        hidden: true,
        name: 'game.party.host.route.restartStageCta',
      }),
    ).not.toHaveAttribute('data-disabled');
    expect(
      screen.getByRole('menuitem', {
        hidden: true,
        name: 'game.party.host.route.resumePartyCta',
      }),
    ).not.toHaveAttribute('data-disabled');
  });

  it('routes the end-party item to the request handler so the surface can show its confirmation', async () => {
    const onRequestEndParty = vi.fn();

    renderWithUiProvider(
      <HostRuntimeCommandMenu
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
          lifecyclePhase: PartyRuntimePhase.STAGE,
          totalStages: null,
        }}
        {...handlers}
        onRequestEndParty={onRequestEndParty}
        pendingCommand={null}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /runtimeMenuTrigger/ }));
    fireEvent.click(
      await screen.findByRole('menuitem', { name: 'game.party.host.route.endPartyCta' }),
    );

    expect(onRequestEndParty).toHaveBeenCalledTimes(1);
  });

  it('does not expose the final leaderboard action from the runtime menu on the last result screen', async () => {
    renderWithUiProvider(
      <HostRuntimeCommandMenu
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
          currentStageNumber: 4,
          hasNextStage: false,
          isPaused: false,
          lifecyclePhase: PartyRuntimePhase.RESULT,
          totalStages: 4,
        }}
        {...handlers}
        pendingCommand={null}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /runtimeMenuTrigger/ }));

    expect(
      screen.queryByRole('menuitem', { name: 'game.party.host.route.showFinalLeaderboardCta' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'game.party.host.route.advanceStageCta' }),
    ).not.toBeInTheDocument();
  });

  it('renders the party music selector inside the host commands menu', async () => {
    renderWithUiProvider(
      <HostRuntimeCommandMenu
        controls={{
          canAdvanceStage: true,
          canEndParty: true,
          canPauseParty: true,
          canRestartStage: true,
          canResumeParty: true,
          canRevealStageResult: true,
          canRewindParty: true,
          canRewindStage: true,
          canStartParty: false,
          currentStageNumber: 1,
          hasNextStage: true,
          isPaused: false,
          lifecyclePhase: PartyRuntimePhase.LOBBY,
          totalStages: 4,
        }}
        {...handlers}
        pendingCommand={null}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /runtimeMenuTrigger/ }));
    expect(await screen.findByText('game.party.host.route.musicPanelTitle')).toBeInTheDocument();
    expect(screen.getByTestId('host-party-music-theme-select')).toBeInTheDocument();
  });

  it('keeps the party music player mounted when the host closes the menu', async () => {
    renderWithUiProvider(
      <HostRuntimeCommandMenu
        controls={{
          canAdvanceStage: true,
          canEndParty: true,
          canPauseParty: true,
          canRestartStage: true,
          canResumeParty: true,
          canRevealStageResult: true,
          canRewindParty: true,
          canRewindStage: true,
          canStartParty: false,
          currentStageNumber: 1,
          hasNextStage: true,
          isPaused: false,
          lifecyclePhase: PartyRuntimePhase.LOBBY,
          totalStages: 4,
        }}
        {...handlers}
        pendingCommand={null}
      />,
    );

    const trigger = screen.getByRole('button', { name: /runtimeMenuTrigger/ });

    fireEvent.click(trigger);
    const audioElement = await screen.findByTestId('host-party-music-audio');
    const themeSelect = screen.getByTestId('host-party-music-theme-select');

    fireEvent.click(trigger);

    expect(screen.getByTestId('host-party-music-audio')).toBe(audioElement);
    expect(screen.getByTestId('host-party-music-theme-select')).toBe(themeSelect);
  });
});

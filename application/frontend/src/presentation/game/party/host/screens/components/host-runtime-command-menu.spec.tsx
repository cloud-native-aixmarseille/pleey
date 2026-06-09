import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HostPartyRuntimeCommand } from '../../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import { PartyRuntimePhase } from '../../../../../../domains/game/party/shared/entities/party-runtime-context';
import { renderWithUiProvider } from '../../../../../../test-utils/render-with-ui-provider';
import { KeyboardShortcutsProvider } from '../../../../../shared/keyboard';
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

function renderHostRuntimeCommandMenu(props: Parameters<typeof HostRuntimeCommandMenu>[0]) {
  return renderWithUiProvider(
    <KeyboardShortcutsProvider>
      <HostRuntimeCommandMenu {...props} />
    </KeyboardShortcutsProvider>,
  );
}

describe('HostRuntimeCommandMenu', () => {
  it('opens the discrete menu and routes a click to the matching runtime handler', async () => {
    const onAdvanceStage = vi.fn();

    renderHostRuntimeCommandMenu({
      controls: {
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
      },
      ...handlers,
      onAdvanceStage,
      pendingCommand: null,
    });

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
    renderHostRuntimeCommandMenu({
      controls: {
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
      },
      ...handlers,
      pendingCommand: HostPartyRuntimeCommand.AdvanceStage,
    });

    fireEvent.click(screen.getByRole('button', { name: /runtimeMenuTrigger/ }));

    const items = await screen.findAllByRole('menuitem');

    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item).toHaveAttribute('data-disabled');
    }
  });

  it('rebuilds the mounted menu items when the pending command clears', async () => {
    const view = renderHostRuntimeCommandMenu({
      controls: {
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
      },
      ...handlers,
      pendingCommand: HostPartyRuntimeCommand.RestartStage,
    });

    fireEvent.click(screen.getByRole('button', { name: /runtimeMenuTrigger/ }));

    expect(
      await screen.findByRole('menuitem', { name: 'game.party.host.route.restartStageCta' }),
    ).toHaveAttribute('data-disabled');

    view.rerender(
      <KeyboardShortcutsProvider>
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
        />
      </KeyboardShortcutsProvider>,
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

    renderHostRuntimeCommandMenu({
      controls: {
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
      },
      ...handlers,
      onRequestEndParty,
      pendingCommand: null,
    });

    fireEvent.click(screen.getByRole('button', { name: /runtimeMenuTrigger/ }));
    fireEvent.click(
      await screen.findByRole('menuitem', { name: 'game.party.host.route.endPartyCta' }),
    );

    expect(onRequestEndParty).toHaveBeenCalledTimes(1);
  });

  it('does not expose the final leaderboard action from the runtime menu on the last result screen', async () => {
    renderHostRuntimeCommandMenu({
      controls: {
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
      },
      ...handlers,
      pendingCommand: null,
    });

    fireEvent.click(screen.getByRole('button', { name: /runtimeMenuTrigger/ }));

    expect(
      screen.queryByRole('menuitem', { name: 'game.party.host.route.showFinalLeaderboardCta' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'game.party.host.route.advanceStageCta' }),
    ).not.toBeInTheDocument();
  });

  it('renders the party music selector inside the host commands menu', async () => {
    renderHostRuntimeCommandMenu({
      controls: {
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
      },
      ...handlers,
      pendingCommand: null,
    });

    fireEvent.click(screen.getByRole('button', { name: /runtimeMenuTrigger/ }));
    expect(await screen.findByText('game.party.host.route.musicPanelTitle')).toBeInTheDocument();
    expect(screen.getByTestId('host-party-music-theme-select')).toBeInTheDocument();
  });

  it('keeps the party music player mounted when the host closes the menu', async () => {
    renderHostRuntimeCommandMenu({
      controls: {
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
      },
      ...handlers,
      pendingCommand: null,
    });

    const trigger = screen.getByRole('button', { name: /runtimeMenuTrigger/ });

    fireEvent.click(trigger);
    const audioElement = await screen.findByTestId('host-party-music-audio');
    const themeSelect = screen.getByTestId('host-party-music-theme-select');

    fireEvent.click(trigger);

    expect(screen.getByTestId('host-party-music-audio')).toBe(audioElement);
    expect(screen.getByTestId('host-party-music-theme-select')).toBe(themeSelect);
  });

  it('routes safe host shortcuts to the matching handlers when enabled', () => {
    const onAdvanceStage = vi.fn();
    const onRevealStageResult = vi.fn();
    const onPauseParty = vi.fn();

    renderHostRuntimeCommandMenu({
      controls: {
        canAdvanceStage: true,
        canEndParty: true,
        canPauseParty: true,
        canRestartStage: true,
        canResumeParty: false,
        canRevealStageResult: true,
        canRewindParty: true,
        canRewindStage: true,
        canStartParty: false,
        currentStageNumber: 2,
        hasNextStage: true,
        isPaused: false,
        lifecyclePhase: PartyRuntimePhase.STAGE,
        totalStages: 4,
      },
      ...handlers,
      onAdvanceStage,
      onPauseParty,
      onRevealStageResult,
      pendingCommand: null,
    });

    fireEvent.keyDown(document, { key: 'n' });
    fireEvent.keyDown(document, { key: 'r' });
    fireEvent.keyDown(document, { key: 'p' });

    expect(onAdvanceStage).toHaveBeenCalledTimes(1);
    expect(onRevealStageResult).toHaveBeenCalledTimes(1);
    expect(onPauseParty).toHaveBeenCalledTimes(1);
  });

  it('routes modifier-based high-impact shortcuts to the matching handlers when enabled', () => {
    const onRequestEndParty = vi.fn();
    const onRestartStage = vi.fn();
    const onRewindParty = vi.fn();
    const onRewindStage = vi.fn();

    renderHostRuntimeCommandMenu({
      controls: {
        canAdvanceStage: true,
        canEndParty: true,
        canPauseParty: true,
        canRestartStage: true,
        canResumeParty: false,
        canRevealStageResult: true,
        canRewindParty: true,
        canRewindStage: true,
        canStartParty: false,
        currentStageNumber: 2,
        hasNextStage: true,
        isPaused: false,
        lifecyclePhase: PartyRuntimePhase.STAGE,
        totalStages: 4,
      },
      ...handlers,
      onRequestEndParty,
      onRestartStage,
      onRewindParty,
      onRewindStage,
      pendingCommand: null,
    });

    fireEvent.keyDown(document, { key: 'B', shiftKey: true });
    fireEvent.keyDown(document, { key: 'R', shiftKey: true });
    fireEvent.keyDown(document, { key: 'L', shiftKey: true });
    fireEvent.keyDown(document, { key: 'E', shiftKey: true });

    expect(onRewindStage).toHaveBeenCalledTimes(1);
    expect(onRestartStage).toHaveBeenCalledTimes(1);
    expect(onRewindParty).toHaveBeenCalledTimes(1);
    expect(onRequestEndParty).toHaveBeenCalledTimes(1);
  });

  it('does not route high-impact actions from unmodified keys', () => {
    const onRequestEndParty = vi.fn();
    const onRestartStage = vi.fn();
    const onRewindParty = vi.fn();
    const onRewindStage = vi.fn();

    renderHostRuntimeCommandMenu({
      controls: {
        canAdvanceStage: true,
        canEndParty: true,
        canPauseParty: true,
        canRestartStage: true,
        canResumeParty: false,
        canRevealStageResult: true,
        canRewindParty: true,
        canRewindStage: true,
        canStartParty: false,
        currentStageNumber: 2,
        hasNextStage: true,
        isPaused: false,
        lifecyclePhase: PartyRuntimePhase.STAGE,
        totalStages: 4,
      },
      ...handlers,
      onRequestEndParty,
      onRestartStage,
      onRewindParty,
      onRewindStage,
      pendingCommand: null,
    });

    fireEvent.keyDown(document, { key: 'b' });
    fireEvent.keyDown(document, { key: 'r' });
    fireEvent.keyDown(document, { key: 'l' });
    fireEvent.keyDown(document, { key: 'e' });

    expect(onRewindStage).not.toHaveBeenCalled();
    expect(onRestartStage).not.toHaveBeenCalled();
    expect(onRewindParty).not.toHaveBeenCalled();
    expect(onRequestEndParty).not.toHaveBeenCalled();
  });

  it('does not route host shortcuts while a command is pending', () => {
    const onAdvanceStage = vi.fn();
    const onRevealStageResult = vi.fn();
    const onPauseParty = vi.fn();

    renderHostRuntimeCommandMenu({
      controls: {
        canAdvanceStage: true,
        canEndParty: true,
        canPauseParty: true,
        canRestartStage: true,
        canResumeParty: false,
        canRevealStageResult: true,
        canRewindParty: true,
        canRewindStage: true,
        canStartParty: false,
        currentStageNumber: 2,
        hasNextStage: true,
        isPaused: false,
        lifecyclePhase: PartyRuntimePhase.STAGE,
        totalStages: 4,
      },
      ...handlers,
      onAdvanceStage,
      onPauseParty,
      onRevealStageResult,
      pendingCommand: HostPartyRuntimeCommand.AdvanceStage,
    });

    fireEvent.keyDown(document, { key: 'n' });
    fireEvent.keyDown(document, { key: 'r' });
    fireEvent.keyDown(document, { key: 'p' });
    fireEvent.keyDown(document, { key: 'B', shiftKey: true });
    fireEvent.keyDown(document, { key: 'R', shiftKey: true });
    fireEvent.keyDown(document, { key: 'L', shiftKey: true });
    fireEvent.keyDown(document, { key: 'E', shiftKey: true });

    expect(onAdvanceStage).not.toHaveBeenCalled();
    expect(onRevealStageResult).not.toHaveBeenCalled();
    expect(onPauseParty).not.toHaveBeenCalled();
  });
});

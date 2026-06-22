import type { ReactNode } from 'react';
import type {
  HostPartyRuntimeCommand,
  HostPartyRuntimeControlsState,
} from '../../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { useKeyboardShortcut, useShortcutScope } from '../../../../../shared/keyboard';
import { Button } from '../../../../../shared/ui/actions/button';
import { AppIcon, type AppIconName } from '../../../../../shared/ui/icons/app-icon';
import {
  DropdownMenu,
  DropdownMenuDivider,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '../../../../../shared/ui/overlay/dropdown-menu';
import { HostPartyMusicThemePanel } from './host-party-music-theme-panel';

const HOST_RUNTIME_SHORTCUT_SCOPE = 'host-runtime-controls';

interface HostRuntimeCommandMenuProps {
  readonly controls: HostPartyRuntimeControlsState;
  readonly pendingCommand: HostPartyRuntimeCommand | null;
  readonly onAdvanceStage: () => void;
  readonly onPauseParty: () => void;
  readonly onRequestEndParty: () => void;
  readonly onRestartStage: () => void;
  readonly onResumeParty: () => void;
  readonly onRevealStageResult: () => void;
  readonly onRewindParty: () => void;
  readonly onRewindStage: () => void;
}

interface MenuEntry {
  readonly ariaKeyShortcuts?: string;
  readonly icon: AppIconName;
  readonly label: string;
  readonly disabled: boolean;
  readonly onSelect: () => void;
}

interface MenuGroup {
  readonly label: string;
  readonly entries?: readonly MenuEntry[];
  readonly content?: ReactNode;
}

enum HostRuntimeCommandMenuInstanceKey {
  Idle = 'idle',
}

export function HostRuntimeCommandMenu({
  controls,
  pendingCommand,
  onAdvanceStage,
  onPauseParty,
  onRequestEndParty,
  onRestartStage,
  onResumeParty,
  onRevealStageResult,
  onRewindParty,
  onRewindStage,
}: HostRuntimeCommandMenuProps) {
  const { t } = usePresentationTranslation();
  const isCommandPending = pendingCommand !== null;
  const canTogglePauseState = controls.canPauseParty || controls.canResumeParty;

  useShortcutScope(HOST_RUNTIME_SHORTCUT_SCOPE, { active: true, priority: 140 });

  useKeyboardShortcut({
    ariaKeyShortcuts: 'r',
    combo: { key: 'r' },
    descriptionKey: 'game.party.host.route.runtimeShortcutRevealStageResult',
    disabled: isCommandPending || !controls.canRevealStageResult,
    execute: onRevealStageResult,
    id: 'reveal-stage-result',
    scope: HOST_RUNTIME_SHORTCUT_SCOPE,
    scopeLabelKey: 'game.party.host.route.runtimeMenuLabel',
  });

  useKeyboardShortcut({
    ariaKeyShortcuts: 'n',
    combo: { key: 'n' },
    descriptionKey: 'game.party.host.route.runtimeShortcutAdvanceStage',
    disabled: isCommandPending || !controls.canAdvanceStage || !controls.hasNextStage,
    execute: onAdvanceStage,
    id: 'advance-stage',
    scope: HOST_RUNTIME_SHORTCUT_SCOPE,
    scopeLabelKey: 'game.party.host.route.runtimeMenuLabel',
  });

  useKeyboardShortcut({
    ariaKeyShortcuts: 'p',
    combo: { key: 'p' },
    descriptionKey: controls.canPauseParty
      ? 'game.party.host.route.runtimeShortcutPauseParty'
      : 'game.party.host.route.runtimeShortcutResumeParty',
    disabled: isCommandPending || !canTogglePauseState,
    execute: controls.canPauseParty ? onPauseParty : onResumeParty,
    id: 'toggle-pause-state',
    scope: HOST_RUNTIME_SHORTCUT_SCOPE,
    scopeLabelKey: 'game.party.host.route.runtimeMenuLabel',
  });

  useKeyboardShortcut({
    ariaKeyShortcuts: 'Shift+B',
    combo: { key: 'b', shift: true },
    descriptionKey: 'game.party.host.route.runtimeShortcutRewindStage',
    disabled: isCommandPending || !controls.canRewindStage,
    execute: onRewindStage,
    id: 'rewind-stage',
    scope: HOST_RUNTIME_SHORTCUT_SCOPE,
    scopeLabelKey: 'game.party.host.route.runtimeMenuLabel',
  });

  useKeyboardShortcut({
    ariaKeyShortcuts: 'Shift+R',
    combo: { key: 'r', shift: true },
    descriptionKey: 'game.party.host.route.runtimeShortcutRestartStage',
    disabled: isCommandPending || !controls.canRestartStage,
    execute: onRestartStage,
    id: 'restart-stage',
    scope: HOST_RUNTIME_SHORTCUT_SCOPE,
    scopeLabelKey: 'game.party.host.route.runtimeMenuLabel',
  });

  useKeyboardShortcut({
    ariaKeyShortcuts: 'Shift+L',
    combo: { key: 'l', shift: true },
    descriptionKey: 'game.party.host.route.runtimeShortcutRewindParty',
    disabled: isCommandPending || !controls.canRewindParty,
    execute: onRewindParty,
    id: 'rewind-party',
    scope: HOST_RUNTIME_SHORTCUT_SCOPE,
    scopeLabelKey: 'game.party.host.route.runtimeMenuLabel',
  });

  useKeyboardShortcut({
    ariaKeyShortcuts: 'Shift+E',
    combo: { key: 'e', shift: true },
    descriptionKey: 'game.party.host.route.runtimeShortcutRequestEndParty',
    disabled: isCommandPending || !controls.canEndParty,
    execute: onRequestEndParty,
    id: 'request-end-party',
    scope: HOST_RUNTIME_SHORTCUT_SCOPE,
    scopeLabelKey: 'game.party.host.route.runtimeMenuLabel',
  });

  const flowGroup: MenuGroup = {
    label: t('game.party.host.route.runtimeMenuGroupFlow'),
    entries: [
      {
        ariaKeyShortcuts: 'r',
        icon: 'success',
        label: t('game.party.host.route.revealStageResultCta'),
        disabled: isCommandPending || !controls.canRevealStageResult,
        onSelect: onRevealStageResult,
      },
      ...(controls.hasNextStage
        ? [
            {
              ariaKeyShortcuts: 'n',
              icon: 'skip-forward' as const,
              label: t('game.party.host.route.advanceStageCta'),
              disabled: isCommandPending || !controls.canAdvanceStage,
              onSelect: onAdvanceStage,
            },
          ]
        : []),
      {
        ariaKeyShortcuts: 'Shift+B',
        icon: 'skip-back',
        label: t('game.party.host.route.rewindStageCta'),
        disabled: isCommandPending || !controls.canRewindStage,
        onSelect: onRewindStage,
      },
      {
        ariaKeyShortcuts: 'Shift+R',
        icon: 'settings',
        label: t('game.party.host.route.restartStageCta'),
        disabled: isCommandPending || !controls.canRestartStage,
        onSelect: onRestartStage,
      },
      {
        ariaKeyShortcuts: 'Shift+L',
        icon: 'skip-back',
        label: t('game.party.host.route.rewindPartyCta'),
        disabled: isCommandPending || !controls.canRewindParty,
        onSelect: onRewindParty,
      },
    ],
  };

  const playbackGroup: MenuGroup = {
    label: t('game.party.host.route.runtimeMenuGroupPlayback'),
    entries: [
      {
        ariaKeyShortcuts: 'p',
        icon: 'pause',
        label: t('game.party.host.route.pausePartyCta'),
        disabled: isCommandPending || !controls.canPauseParty,
        onSelect: onPauseParty,
      },
      {
        icon: 'play',
        label: t('game.party.host.route.resumePartyCta'),
        disabled: isCommandPending || !controls.canResumeParty,
        onSelect: onResumeParty,
      },
    ],
  };

  const dangerGroup: MenuGroup = {
    label: t('game.party.host.route.runtimeMenuGroupDanger'),
    entries: [
      {
        ariaKeyShortcuts: 'Shift+E',
        icon: 'power',
        label: t('game.party.host.route.endPartyCta'),
        disabled: isCommandPending || !controls.canEndParty,
        onSelect: onRequestEndParty,
      },
    ],
  };

  const musicGroup: MenuGroup = {
    label: t('game.party.host.route.musicPanelTitle'),
    content: <HostPartyMusicThemePanel />,
  };

  const groups: readonly MenuGroup[] = [flowGroup, playbackGroup, musicGroup, dangerGroup];
  const menuInstanceKey = pendingCommand ?? HostRuntimeCommandMenuInstanceKey.Idle;

  return (
    <DropdownMenu
      ariaLabel={t('game.party.host.route.runtimeMenuLabel')}
      key={menuInstanceKey}
      keepMounted
      position="bottom-end"
      shadow="md"
      trigger={
        <Button
          intent="ghost"
          leftSection={<AppIcon name="settings" size={16} />}
          rightSection={<AppIcon name="chevron-down" size={14} />}
          size="sm"
        >
          {t('game.party.host.route.runtimeMenuTrigger')}
        </Button>
      }
      width={300}
      withinPortal
    >
      {groups.map((group, groupIndex) => (
        <RuntimeMenuGroup
          key={group.label}
          group={group}
          withDivider={groupIndex < groups.length - 1}
        />
      ))}
    </DropdownMenu>
  );
}

function RuntimeMenuGroup({
  group,
  withDivider,
}: {
  readonly group: MenuGroup;
  readonly withDivider: boolean;
}) {
  return (
    <>
      <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
      {group.entries?.map((entry) => (
        <DropdownMenuItem
          aria-keyshortcuts={entry.ariaKeyShortcuts}
          disabled={entry.disabled}
          key={entry.label}
          leftSection={<AppIcon name={entry.icon} size={16} />}
          onClick={entry.onSelect}
        >
          {entry.label}
        </DropdownMenuItem>
      ))}
      {group.content}
      {withDivider ? <DropdownMenuDivider /> : null}
    </>
  );
}

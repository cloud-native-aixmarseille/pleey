import { Menu } from '@mantine/core';
import type {
  HostPartyRuntimeCommand,
  HostPartyRuntimeControlsState,
} from '../../../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../../shared/ui/actions/button';
import { uiThemeTokens } from '../../../../../../shared/ui/foundation/ui-theme';
import { AppIcon, type AppIconName } from '../../../../../../shared/ui/icons/app-icon';

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
  readonly icon: AppIconName;
  readonly label: string;
  readonly disabled: boolean;
  readonly onSelect: () => void;
}

interface MenuGroup {
  readonly label: string;
  readonly entries: readonly MenuEntry[];
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

  const flowGroup: MenuGroup = {
    label: t('game.party.host.route.runtimeMenuGroupFlow'),
    entries: [
      {
        icon: 'success',
        label: t('game.party.host.route.revealStageResultCta'),
        disabled: isCommandPending || !controls.canRevealStageResult,
        onSelect: onRevealStageResult,
      },
      ...(controls.hasNextStage
        ? [
            {
              icon: 'skip-forward' as const,
              label: t('game.party.host.route.advanceStageCta'),
              disabled: isCommandPending || !controls.canAdvanceStage,
              onSelect: onAdvanceStage,
            },
          ]
        : []),
      {
        icon: 'skip-back',
        label: t('game.party.host.route.rewindStageCta'),
        disabled: isCommandPending || !controls.canRewindStage,
        onSelect: onRewindStage,
      },
      {
        icon: 'settings',
        label: t('game.party.host.route.restartStageCta'),
        disabled: isCommandPending || !controls.canRestartStage,
        onSelect: onRestartStage,
      },
      {
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
        icon: 'power',
        label: t('game.party.host.route.endPartyCta'),
        disabled: isCommandPending || !controls.canEndParty,
        onSelect: onRequestEndParty,
      },
    ],
  };

  const groups: readonly MenuGroup[] = [flowGroup, playbackGroup, dangerGroup];

  return (
    <Menu position="bottom-end" shadow="md" width={240} withinPortal>
      <Menu.Target>
        <Button
          intent="ghost"
          leftSection={<AppIcon name="settings" size={16} />}
          rightSection={<AppIcon name="chevron-down" size={14} />}
          size="sm"
        >
          {t('game.party.host.route.runtimeMenuTrigger')}
        </Button>
      </Menu.Target>

      <Menu.Dropdown
        aria-label={t('game.party.host.route.runtimeMenuLabel')}
        style={{
          background: `color-mix(in srgb, ${uiThemeTokens.color.surface.overlay} 76%, ${uiThemeTokens.color.surface.panel})`,
          backdropFilter: 'blur(12px)',
          border: `1px solid ${uiThemeTokens.color.border.subtle}`,
          boxShadow: uiThemeTokens.shadow.elevated,
        }}
      >
        {groups.map((group, groupIndex) => (
          <RuntimeMenuGroup
            key={group.label}
            group={group}
            withDivider={groupIndex < groups.length - 1}
          />
        ))}
      </Menu.Dropdown>
    </Menu>
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
      <Menu.Label>{group.label}</Menu.Label>
      {group.entries.map((entry) => (
        <Menu.Item
          key={entry.label}
          disabled={entry.disabled}
          leftSection={<AppIcon name={entry.icon} size={16} />}
          onClick={entry.onSelect}
        >
          {entry.label}
        </Menu.Item>
      ))}
      {withDivider ? <Menu.Divider /> : null}
    </>
  );
}

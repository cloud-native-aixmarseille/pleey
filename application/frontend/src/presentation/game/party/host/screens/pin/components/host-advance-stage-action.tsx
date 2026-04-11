import type {
  HostPartyRuntimeCommand,
  HostPartyRuntimeControlsState,
} from '../../../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../../shared/ui/actions/button';
import { Badge } from '../../../../../../shared/ui/feedback/badge';
import { AppIcon } from '../../../../../../shared/ui/icons/app-icon';
import { SplitWrapRow, WrapRow } from '../../../../../../shared/ui/layout/containers';
import { ElevatedPanel } from '../../../../../../shared/ui/layout/panels';
import { SupportingText } from '../../../../../../shared/ui/layout/typography';

interface HostAdvanceStageActionProps {
  readonly controls: HostPartyRuntimeControlsState;
  readonly pendingCommand: HostPartyRuntimeCommand | null;
  readonly onAdvanceStage: () => void;
}

export function HostAdvanceStageAction({
  controls,
  pendingCommand,
  onAdvanceStage,
}: HostAdvanceStageActionProps) {
  const { t } = usePresentationTranslation();
  const isCommandPending = pendingCommand !== null;

  if (!controls.canAdvanceStage) {
    return null;
  }

  return (
    <ElevatedPanel padding="md">
      <SplitWrapRow align="center" gap="md">
        <WrapRow gap="sm">
          {controls.currentStageNumber !== null && controls.totalStages !== null ? (
            <Badge icon={<AppIcon name="skip-forward" size={14} />} tone="success">
              {t('game.party.route.runtimeStageProgress', {
                current: String(controls.currentStageNumber),
                total: String(controls.totalStages),
              })}
            </Badge>
          ) : null}
          <SupportingText tone="soft">
            {isCommandPending
              ? t('game.party.host.route.runtimePending')
              : t('game.party.host.route.runtimeResultHint')}
          </SupportingText>
        </WrapRow>

        <Button
          disabled={isCommandPending}
          intent="primary"
          leftSection={
            <AppIcon name={controls.hasNextStage ? 'skip-forward' : 'trophy'} size={18} />
          }
          onClick={onAdvanceStage}
          size="md"
        >
          {t(
            controls.hasNextStage
              ? 'game.party.host.route.advanceStageCta'
              : 'game.party.host.route.showFinalLeaderboardCta',
          )}
        </Button>
      </SplitWrapRow>
    </ElevatedPanel>
  );
}

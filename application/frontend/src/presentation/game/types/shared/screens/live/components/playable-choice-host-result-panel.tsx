import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { ContentStack, ResponsiveGrid } from '../../../../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../../../../shared/ui/layout/panels';
import { Heading, SupportingText } from '../../../../../../shared/ui/layout/typography';
import {
  MotionStagger,
  MotionStaggerItem,
} from '../../../../../../shared/ui/motion/motion-primitives';
import { PartyStandingsList } from '../../../../../party/shared/screens/components/party-standings-list';
import { usePartyStageScoreboardSnapshot } from '../../../../../party/shared/screens/use-party-stage-scoreboard-snapshot';
import { resolvePlayableChoiceActionSlotLabel } from './playable-choice-action-slot-identity';
import { PlayableChoiceResultActionTile } from './playable-choice-result-action-tile';
import type { PlayableChoiceHostRuntimePanelProps } from './playable-choice-runtime-panel.types';
export function PlayableChoiceHostResultPanel({
  copy,
  party,
  testIdPrefix,
}: PlayableChoiceHostRuntimePanelProps) {
  const { t } = usePresentationTranslation();
  const stagePosition = party.context?.lifecycle.stagePosition;
  const result = party.context?.result?.current;
  const previousScores = usePartyStageScoreboardSnapshot(party.players, stagePosition);

  if (!result || stagePosition === null || stagePosition === undefined) {
    return null;
  }

  return (
    <div data-testid={`${testIdPrefix}-host-result-panel`}>
      <ContentStack gap="lg">
        <InsetPanel padding="md">
          <ContentStack gap="md">
            <SupportingText tone="soft">
              {t('game.party.route.runtimeStageProgress', {
                current: String(stagePosition + 1),
                total: String(party.context?.lifecycle.totalStages ?? stagePosition + 1),
              })}
            </SupportingText>

            <Heading level={3}>{result.text}</Heading>
            <SupportingText tone="soft">{t(copy.resultHeading)}</SupportingText>

            <MotionStagger>
              <ResponsiveGrid columns={{ base: 1, md: 2 }} gap="md">
                {result.actions.map((action, index) => (
                  <MotionStaggerItem key={action.id}>
                    <PlayableChoiceResultActionTile
                      actionCount={action.actionCount}
                      actionPercent={action.actionPercent}
                      copy={copy}
                      index={index}
                      isCorrect={action.isCorrect}
                      isSelected={false}
                      slotCount={result.actions.length}
                      testId={`${testIdPrefix}-host-result-action-${resolvePlayableChoiceActionSlotLabel(index).toLowerCase()}`}
                      text={action.text}
                    />
                  </MotionStaggerItem>
                ))}
              </ResponsiveGrid>
            </MotionStagger>
          </ContentStack>
        </InsetPanel>

        <PartyStandingsList
          players={party.players}
          previousScores={previousScores}
          testIdPrefix={`${testIdPrefix}-stage-result-rankings`}
          totalStages={party.context?.lifecycle.totalStages ?? stagePosition + 1}
          title={t('game.party.route.stageResultsStandingsTitle')}
        />
      </ContentStack>
    </div>
  );
}

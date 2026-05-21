import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { StatusBanner } from '../../../../../../shared/ui/feedback/status-banner';
import { ContentStack, ResponsiveGrid } from '../../../../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../../../../shared/ui/layout/panels';
import { Heading, SupportingText } from '../../../../../../shared/ui/layout/typography';
import {
  MotionStagger,
  MotionStaggerItem,
} from '../../../../../../shared/ui/motion/motion-primitives';
import { PlayerPartyStatusBar } from '../../../../../party/player/screens/pin/components/player-party-status-bar';
import { PlayableChoiceResultActionTile } from './playable-choice-result-action-tile';
import type { PlayableChoicePlayerResultSurfaceProps } from './playable-choice-runtime-panel.types';

export function PlayableChoicePlayerResultSurface({
  copy,
  onLeaveParty,
  party,
  testIdPrefix,
}: PlayableChoicePlayerResultSurfaceProps) {
  const { t } = usePresentationTranslation();
  const stagePosition = party.context?.lifecycle.stagePosition;
  const result = party.context?.result;
  const currentResult = result?.current;
  const currentPlayerResult = result?.currentPlayer;

  if (!currentResult || stagePosition === null || stagePosition === undefined) {
    return null;
  }

  return (
    <div data-testid={`${testIdPrefix}-player-result-surface`}>
      <ContentStack gap="lg">
        <PlayerPartyStatusBar
          onLeaveParty={onLeaveParty}
          pausedText={t(copy.paused)}
          party={party}
          variant="paused-only"
        />

        <InsetPanel padding="md">
          <ContentStack gap="md">
            <SupportingText tone="soft">
              {t('game.party.route.runtimeStageProgress', {
                current: String(stagePosition + 1),
                total: String(party.context?.lifecycle.totalStages ?? stagePosition + 1),
              })}
            </SupportingText>

            <Heading level={3}>{currentResult.text}</Heading>

            {currentPlayerResult ? (
              <StatusBanner tone={currentPlayerResult.isCorrect ? 'success' : 'warning'}>
                {currentPlayerResult.isCorrect ? t(copy.resultCorrect) : t(copy.resultIncorrect)}
              </StatusBanner>
            ) : null}

            {currentPlayerResult && !currentPlayerResult.isCorrect ? (
              <SupportingText tone="soft">{t(copy.resultIncorrectHint)}</SupportingText>
            ) : null}

            {currentPlayerResult ? (
              <Heading level={3}>
                {t(copy.pointsAwarded, { points: String(currentPlayerResult.earnedPoints) })}
              </Heading>
            ) : null}

            <SupportingText tone="soft">{t(copy.resultHeading)}</SupportingText>

            <MotionStagger>
              <ResponsiveGrid columns={{ base: 1, md: 2 }} gap="md">
                {currentResult.actions.map((action, index) => {
                  const isSelected = currentPlayerResult?.selectedActionId === action.id;

                  return (
                    <MotionStaggerItem key={action.id}>
                      <PlayableChoiceResultActionTile
                        actionCount={action.actionCount}
                        actionPercent={action.actionPercent}
                        copy={copy}
                        index={index}
                        isCorrect={action.isCorrect}
                        isSelected={isSelected}
                        slotCount={currentResult.actions.length}
                        text={action.text}
                      />
                    </MotionStaggerItem>
                  );
                })}
              </ResponsiveGrid>
            </MotionStagger>
          </ContentStack>
        </InsetPanel>
      </ContentStack>
    </div>
  );
}

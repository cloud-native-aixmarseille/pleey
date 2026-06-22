import { PartyStatus } from '../../../../../../../domains/game/party/shared/entities/party-status';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { Badge } from '../../../../../../shared/ui/feedback/badge';
import { AppIcon } from '../../../../../../shared/ui/icons/app-icon';
import { ContentStack, ResponsiveGrid } from '../../../../../../shared/ui/layout/containers';
import { HeroPanel, InsetPanel } from '../../../../../../shared/ui/layout/panels';
import { Heading, SummaryText } from '../../../../../../shared/ui/layout/typography';
import {
  MotionFadeIn,
  MotionStagger,
  MotionStaggerItem,
} from '../../../../../../shared/ui/motion/motion-primitives';
import { resolvePlayableChoiceActionSlotLabel } from './playable-choice-action-slot-identity';
import {
  stageContentStyle,
  stageMetaPrimarySlotStyle,
  stageMetaRowStyle,
  stageMetaStatusStyle,
  stageMetaStyle,
  stageMetaTimerSlotStyle,
  stagePromptContentStyle,
  stagePromptRegionStyle,
  stageShellStyle,
} from './playable-choice-host-stage-panel.styles';
import { PlayableChoiceResultActionTile } from './playable-choice-result-action-tile';
import type { PlayableChoiceHostRuntimePanelProps } from './playable-choice-runtime-panel.types';
import { StageCountdownTimer } from './stage-countdown-timer';
import {
  resolveStageTotalDurationMs,
  useStageRemainingDurationMs,
} from './use-stage-remaining-duration-ms';

const STAGE_ANSWER_REVEAL_INITIAL_DELAY_SECONDS = 1.8;
const STAGE_ANSWER_REVEAL_STAGGER_SECONDS = 0.22;
const STAGE_QUESTION_REVEAL_DURATION_SECONDS = 1.0;

export function PlayableChoiceHostStagePanel({
  copy,
  party,
  testIdPrefix,
}: PlayableChoiceHostRuntimePanelProps) {
  const { t } = usePresentationTranslation();
  const stagePosition = party.context?.lifecycle.stagePosition;
  const stageId = party.context?.lifecycle.stageId ?? null;
  const currentStage = party.context?.stage?.current;
  const actionSubmission = party.context?.stage?.actionSubmission;
  const remainingDurationMs = useStageRemainingDurationMs(party);
  const totalDurationMs = resolveStageTotalDurationMs(party);

  if (!currentStage || !actionSubmission || stagePosition === null || stagePosition === undefined) {
    return null;
  }

  const totalStages = party.context?.lifecycle.totalStages ?? stagePosition + 1;
  const submittedPlayerCount = actionSubmission.submittedPlayerCount;
  const totalEligiblePlayerCount = actionSubmission.totalEligiblePlayerCount;
  const pendingResponseCount = Math.max(totalEligiblePlayerCount - submittedPlayerCount, 0);
  const submissionProgressLabel = t('game.party.route.runtimeResponsesReceived', {
    submitted: String(submittedPlayerCount),
    total: String(totalEligiblePlayerCount),
  });
  const submissionStateLabel =
    pendingResponseCount === 0
      ? t('game.party.route.runtimeResponsesComplete')
      : t('game.party.route.runtimeResponsesPending', {
          remaining: String(pendingResponseCount),
        });

  return (
    <div data-testid={`${testIdPrefix}-host-stage-panel`} style={stageShellStyle}>
      <HeroPanel padding="xl">
        <div style={stageContentStyle}>
          <div style={stageMetaStyle}>
            <InsetPanel padding="md" tone={pendingResponseCount === 0 ? 'success' : 'default'}>
              <div style={stageMetaRowStyle}>
                <div style={stageMetaPrimarySlotStyle}>
                  <Badge icon={<AppIcon name="skip-forward" size={14} />} tone="info">
                    {t('game.party.route.runtimeStageProgress', {
                      current: String(stagePosition + 1),
                      total: String(totalStages),
                    })}
                  </Badge>
                </div>
                <div style={stageMetaTimerSlotStyle}>
                  <StageCountdownTimer
                    isPaused={party.status === PartyStatus.PAUSED}
                    remainingDurationMs={remainingDurationMs}
                    size="md"
                    testId={`${testIdPrefix}-host-stage-timer`}
                    totalDurationMs={totalDurationMs}
                  />
                </div>
                <div style={stageMetaStatusStyle}>
                  <ContentStack align="center" gap="xs">
                    <Badge
                      icon={
                        <AppIcon
                          name={pendingResponseCount === 0 ? 'success' : 'pending'}
                          size={12}
                        />
                      }
                      tone={pendingResponseCount === 0 ? 'success' : 'warning'}
                    >
                      {submissionStateLabel}
                    </Badge>
                    <SummaryText>{submissionProgressLabel}</SummaryText>
                  </ContentStack>
                </div>
              </div>
            </InsetPanel>
          </div>

          <div style={stagePromptRegionStyle}>
            <div style={stagePromptContentStyle}>
              <ContentStack align="center" gap="md">
                <MotionFadeIn
                  key={`question-${stageId}`}
                  duration={STAGE_QUESTION_REVEAL_DURATION_SECONDS}
                >
                  <Heading hero level={1}>
                    {currentStage.text}
                  </Heading>
                </MotionFadeIn>
              </ContentStack>
            </div>
          </div>

          <MotionStagger
            key={`answers-${stageId}`}
            initialDelay={STAGE_ANSWER_REVEAL_INITIAL_DELAY_SECONDS}
            staggerDelay={STAGE_ANSWER_REVEAL_STAGGER_SECONDS}
          >
            <ResponsiveGrid columns={{ base: 1, sm: 2 }} gap="lg">
              {currentStage.actions.map((action, index) => (
                <MotionStaggerItem key={action.id}>
                  <PlayableChoiceResultActionTile
                    copy={copy}
                    index={index}
                    isCorrect={false}
                    isSelected={false}
                    slotCount={currentStage.actions.length}
                    testId={`${testIdPrefix}-host-stage-action-${resolvePlayableChoiceActionSlotLabel(index).toLowerCase()}`}
                    text={action.text}
                  />
                </MotionStaggerItem>
              ))}
            </ResponsiveGrid>
          </MotionStagger>
        </div>
      </HeroPanel>
    </div>
  );
}

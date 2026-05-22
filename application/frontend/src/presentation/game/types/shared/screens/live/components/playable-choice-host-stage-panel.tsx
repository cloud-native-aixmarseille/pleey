import { PartyStatus } from '../../../../../../../domains/game/party/shared/entities/party-status';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { StatusBanner } from '../../../../../../shared/ui/feedback/status-banner';
import {
  ContentStack,
  ResponsiveGrid,
  SplitWrapRow,
} from '../../../../../../shared/ui/layout/containers';
import { HeroPanel } from '../../../../../../shared/ui/layout/panels';
import { Heading, SupportingText } from '../../../../../../shared/ui/layout/typography';
import {
  MotionFadeIn,
  MotionStagger,
  MotionStaggerItem,
} from '../../../../../../shared/ui/motion/motion-primitives';
import { resolvePlayableChoiceActionSlotLabel } from './playable-choice-action-slot-identity';
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

const stageShellStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: 'calc(100vh - 240px)',
  width: '100%',
} as const;

const stageContentStyle = {
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: 'var(--mantine-spacing-xl)',
} as const;

const stagePromptRegionStyle = {
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  textAlign: 'center',
  width: '100%',
} as const;

const stagePromptContentStyle = {
  margin: '0 auto',
  maxWidth: '60rem',
  width: '100%',
} as const;

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
  const submissionStatusMessage =
    pendingResponseCount === 0
      ? `${t('game.party.route.runtimeResponsesReceived', {
          submitted: String(submittedPlayerCount),
          total: String(totalEligiblePlayerCount),
        })}. ${t('game.party.route.runtimeResponsesComplete')}`
      : `${t('game.party.route.runtimeResponsesReceived', {
          submitted: String(submittedPlayerCount),
          total: String(totalEligiblePlayerCount),
        })}. ${t('game.party.route.runtimeResponsesPending', {
          remaining: String(pendingResponseCount),
        })}`;

  return (
    <div data-testid={`${testIdPrefix}-host-stage-panel`} style={stageShellStyle}>
      <HeroPanel padding="xl">
        <div style={stageContentStyle}>
          <SplitWrapRow>
            <SupportingText tone="soft">
              {t('game.party.route.runtimeStageProgress', {
                current: String(stagePosition + 1),
                total: String(totalStages),
              })}
            </SupportingText>
            <StageCountdownTimer
              isPaused={party.status === PartyStatus.PAUSED}
              remainingDurationMs={remainingDurationMs}
              size="md"
              testId={`${testIdPrefix}-host-stage-timer`}
              totalDurationMs={totalDurationMs}
            />
            <StatusBanner tone={pendingResponseCount === 0 ? 'success' : 'warning'}>
              {submissionStatusMessage}
            </StatusBanner>
          </SplitWrapRow>

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

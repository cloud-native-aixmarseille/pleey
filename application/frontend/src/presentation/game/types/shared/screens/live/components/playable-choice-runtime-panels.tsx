import type { PartyActionId } from '../../../../../../../domains/game/party/shared/entities/party-action';
import type { PartyObservation } from '../../../../../../../domains/game/party/shared/entities/party-observation';
import { PartyStatus } from '../../../../../../../domains/game/party/shared/entities/party-status';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { StatusBanner } from '../../../../../../shared/ui/feedback/status-banner';
import {
  ContentStack,
  ResponsiveGrid,
  SplitWrapRow,
} from '../../../../../../shared/ui/layout/containers';
import { HeroPanel, InsetPanel } from '../../../../../../shared/ui/layout/panels';
import { Heading, SupportingText } from '../../../../../../shared/ui/layout/typography';
import { PlayerPartyStatusBar } from '../../../../../party/player/screens/pin/components/player-party-status-bar';
import { PlayerStageSurfaceFrame } from '../../../../../party/player/screens/pin/components/player-stage-surface-frame';
import { resolvePlayableChoiceActionSlotLabel } from './playable-choice-action-slot-identity';
import {
  PlayableChoiceResultActionTile,
  type PlayableChoiceResultActionTileCopy,
} from './playable-choice-result-action-tile';

export interface PlayableChoiceRuntimeCopy extends PlayableChoiceResultActionTileCopy {
  readonly paused: string;
  readonly pointsAwarded: string;
  readonly responseLocked: string;
  readonly resultCorrect: string;
  readonly resultHeading: string;
  readonly resultIncorrect: string;
  readonly resultIncorrectHint: string;
  readonly submissionProgress: string;
}

interface PlayableChoiceHostRuntimePanelProps {
  readonly copy: PlayableChoiceRuntimeCopy;
  readonly party: PartyObservation;
  readonly testIdPrefix: string;
}

interface PlayableChoicePlayerStageSurfaceProps extends PlayableChoiceHostRuntimePanelProps {
  readonly onLeaveParty: () => void;
  readonly onSubmitAction: (actionId: PartyActionId) => void;
  readonly pendingActionId: PartyActionId | null;
  readonly playerActionErrorMessage: string | null;
}

interface PlayableChoicePlayerResultSurfaceProps extends PlayableChoiceHostRuntimePanelProps {
  readonly onLeaveParty: () => void;
}

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
  const currentStage = party.context?.stage?.current;
  const actionSubmission = party.context?.stage?.actionSubmission;

  if (!currentStage || !actionSubmission) {
    return null;
  }

  const totalStages = party.context?.lifecycle.totalStages ?? currentStage.stagePosition + 1;

  return (
    <div data-testid={`${testIdPrefix}-host-stage-panel`} style={stageShellStyle}>
      <HeroPanel padding="xl">
        <div style={stageContentStyle}>
          <SplitWrapRow>
            <SupportingText tone="soft">
              {t('game.party.route.runtimeStageProgress', {
                current: String(currentStage.stagePosition + 1),
                total: String(totalStages),
              })}
            </SupportingText>
            <SupportingText tone="soft">
              {t(copy.submissionProgress, {
                submitted: String(actionSubmission.submittedPlayerCount),
                total: String(actionSubmission.totalEligiblePlayerCount),
              })}
            </SupportingText>
          </SplitWrapRow>

          {party.status === PartyStatus.PAUSED ? (
            <StatusBanner tone="warning">{t(copy.paused)}</StatusBanner>
          ) : null}

          <div style={stagePromptRegionStyle}>
            <div style={stagePromptContentStyle}>
              <ContentStack align="center" gap="md">
                <Heading hero level={1}>
                  {currentStage.text}
                </Heading>
              </ContentStack>
            </div>
          </div>

          <ResponsiveGrid columns={{ base: 1, sm: 2 }} gap="lg">
            {currentStage.actions.map((action, index) => (
              <PlayableChoiceResultActionTile
                key={action.id}
                copy={copy}
                index={index}
                isCorrect={false}
                isSelected={false}
                slotCount={currentStage.actions.length}
                testId={`${testIdPrefix}-host-stage-action-${resolvePlayableChoiceActionSlotLabel(index).toLowerCase()}`}
                text={action.text}
              />
            ))}
          </ResponsiveGrid>
        </div>
      </HeroPanel>
    </div>
  );
}

export function PlayableChoiceHostResultPanel({
  copy,
  party,
  testIdPrefix,
}: PlayableChoiceHostRuntimePanelProps) {
  const { t } = usePresentationTranslation();
  const result = party.context?.result?.current;

  if (!result) {
    return null;
  }

  return (
    <div data-testid={`${testIdPrefix}-host-result-panel`}>
      <InsetPanel padding="md">
        <ContentStack gap="md">
          <SupportingText tone="soft">
            {t('game.party.route.runtimeStageProgress', {
              current: String(result.stagePosition + 1),
              total: String(party.context?.lifecycle.totalStages ?? result.stagePosition + 1),
            })}
          </SupportingText>

          <Heading level={3}>{result.text}</Heading>
          <SupportingText tone="soft">{t(copy.resultHeading)}</SupportingText>

          <ResponsiveGrid columns={{ base: 1, md: 2 }} gap="md">
            {result.actions.map((action, index) => (
              <PlayableChoiceResultActionTile
                key={action.id}
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
            ))}
          </ResponsiveGrid>
        </ContentStack>
      </InsetPanel>
    </div>
  );
}

export function PlayableChoicePlayerStageSurface({
  copy,
  onLeaveParty,
  onSubmitAction,
  party,
  pendingActionId,
  playerActionErrorMessage,
  testIdPrefix,
}: PlayableChoicePlayerStageSurfaceProps) {
  const { t } = usePresentationTranslation();
  const currentStage = party.context?.stage?.current;
  const currentPlayerAction = party.context?.stage?.actionSubmission?.currentPlayer ?? null;

  if (!currentStage) {
    return null;
  }

  const selectedActionId = currentPlayerAction?.selectedActionId ?? pendingActionId;
  const isSubmitting = pendingActionId !== null && currentPlayerAction === null;
  const isLocked = currentPlayerAction !== null;
  const areActionsDisabled = party.status !== PartyStatus.ACTIVE || isSubmitting || isLocked;

  return (
    <PlayerStageSurfaceFrame
      isLocked={isLocked}
      isSubmitting={isSubmitting}
      lockedLabel={t(copy.responseLocked)}
      onLeaveParty={onLeaveParty}
      party={party}
      playerActionErrorMessage={playerActionErrorMessage}
      submittingLabel={t('game.party.player.route.actionSubmitting')}
      testId={`${testIdPrefix}-player-stage-surface`}
    >
      <ResponsiveGrid columns={{ base: 1, sm: 2 }} gap="md">
        {currentStage.actions.map((action, index) => {
          const isSelected = selectedActionId === action.id;

          return (
            <PlayableChoiceResultActionTile
              key={action.id}
              copy={copy}
              disabled={areActionsDisabled}
              index={index}
              isCorrect={false}
              isSelected={isSelected}
              onClick={() => onSubmitAction(action.id)}
              slotCount={currentStage.actions.length}
              testId={`${testIdPrefix}-player-stage-action-${resolvePlayableChoiceActionSlotLabel(index).toLowerCase()}`}
              text={action.text}
            />
          );
        })}
      </ResponsiveGrid>
    </PlayerStageSurfaceFrame>
  );
}

export function PlayableChoicePlayerResultSurface({
  copy,
  onLeaveParty,
  party,
  testIdPrefix,
}: PlayableChoicePlayerResultSurfaceProps) {
  const { t } = usePresentationTranslation();
  const result = party.context?.result;
  const currentResult = result?.current;
  const currentPlayerResult = result?.currentPlayer;

  if (!currentResult) {
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
                current: String(currentResult.stagePosition + 1),
                total: String(
                  party.context?.lifecycle.totalStages ?? currentResult.stagePosition + 1,
                ),
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

            <ResponsiveGrid columns={{ base: 1, md: 2 }} gap="md">
              {currentResult.actions.map((action, index) => {
                const isSelected = currentPlayerResult?.selectedActionId === action.id;

                return (
                  <PlayableChoiceResultActionTile
                    key={action.id}
                    actionCount={action.actionCount}
                    actionPercent={action.actionPercent}
                    copy={copy}
                    index={index}
                    isCorrect={action.isCorrect}
                    isSelected={isSelected}
                    slotCount={currentResult.actions.length}
                    text={action.text}
                  />
                );
              })}
            </ResponsiveGrid>
          </ContentStack>
        </InsetPanel>
      </ContentStack>
    </div>
  );
}

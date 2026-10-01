import { useState } from 'react';
import type { PartyActionId } from '../../../../../../../domains/game/party/shared/entities/party-action';
import { PartyStatus } from '../../../../../../../domains/game/party/shared/entities/party-status';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { useKeyboardShortcut, useShortcutScope } from '../../../../../../shared/keyboard';
import { Button } from '../../../../../../shared/ui/actions/button';
import { ResponsiveGrid } from '../../../../../../shared/ui/layout/containers';
import { SupportingText } from '../../../../../../shared/ui/layout/typography';
import { usePresentationMediaQuery } from '../../../../../../shared/ui/layout/use-presentation-media-query';
import { MotionStagger, MotionStaggerItem } from '../../../../../../shared/ui/motion/motion-primitives';
import { PlayerStageSurfaceFrame } from '../../../../../party/player/screens/components/player-stage-surface-frame';
import { resolvePlayableChoiceActionSlotLabel } from './playable-choice-action-slot-identity';
import { mobileTileWrapperStyle, resolveMobileGridStyle } from './playable-choice-player-stage-surface.styles';
import { PlayableChoiceResultActionTile } from './playable-choice-result-action-tile';
import type { PlayableChoicePlayerStageSurfaceProps } from './playable-choice-runtime-panel.types';
import { StageCountdownTimer } from './stage-countdown-timer';
import { resolveStageTotalDurationMs, useStageRemainingDurationMs } from './use-stage-remaining-duration-ms';
import { useStageRevealPhase } from './use-stage-reveal-phase';

const STAGE_ANSWER_REVEAL_INITIAL_DELAY_SECONDS_DESKTOP = 1.8;
const STAGE_ANSWER_REVEAL_STAGGER_SECONDS_DESKTOP = 0.22;
const STAGE_REVEAL_LOCK_MS_DESKTOP = 2_800;
const STAGE_ANSWER_REVEAL_INITIAL_DELAY_SECONDS_MOBILE = 1.4;
const STAGE_ANSWER_REVEAL_STAGGER_SECONDS_MOBILE = 0.18;
const STAGE_REVEAL_LOCK_MS_MOBILE = 0;
const MAX_SHORTCUT_ACTION_COUNT = 9;

function PlayableChoiceActionShortcutRegistration({
  actionId,
  enabled,
  onSelectAction,
  scope,
  shortcutNumber,
}: {
  readonly actionId: PartyActionId;
  readonly enabled: boolean;
  readonly onSelectAction: (actionId: PartyActionId) => void;
  readonly scope: string;
  readonly shortcutNumber: number;
}) {
  useKeyboardShortcut({
    ariaKeyShortcuts: String(shortcutNumber),
    combo: { key: String(shortcutNumber) },
    descriptionKey: 'game.party.player.route.answerShortcut',
    descriptionVariables: { number: String(shortcutNumber) },
    disabled: !enabled,
    execute: () => onSelectAction(actionId),
    id: `select-answer-${shortcutNumber}`,
    scope,
    scopeLabelKey: 'game.party.player.route.answerShortcuts',
  });

  return null;
}

export function PlayableChoicePlayerStageSurface({
  copy,
  onLeaveParty,
  onSubmitAction,
  party,
  pendingActionIds,
  playerActionErrorMessage,
  testIdPrefix,
}: PlayableChoicePlayerStageSurfaceProps) {
  const { t } = usePresentationTranslation();
  const isMobile = usePresentationMediaQuery();
  const currentStage = party.context?.stage?.current;
  const stageId = party.context?.lifecycle.stageId ?? null;
  const stageEndsAtEpochMs = party.context?.lifecycle.stageEndsAtEpochMs ?? null;
  const stageRevealCycleKey = stageId === null ? null : `${stageId}-${stageEndsAtEpochMs ?? 'no-deadline'}`;
  const currentPlayerAction = party.context?.stage?.actionSubmission?.currentPlayer ?? null;
  const currentPlayerActionIds =
    currentPlayerAction?.selectedActionIds ?? (currentPlayerAction ? [currentPlayerAction.selectedActionId] : []);
  const [multiSelection, setMultiSelection] = useState({ actionIds: currentPlayerActionIds, stageId });
  const selectedMultiActionIds = multiSelection.stageId === stageId ? multiSelection.actionIds : currentPlayerActionIds;
  const remainingDurationMs = useStageRemainingDurationMs(party);
  const totalDurationMs = resolveStageTotalDurationMs(party);
  const isStageTimerExpired = remainingDurationMs === 0;
  const stageRevealLockMs = isMobile ? STAGE_REVEAL_LOCK_MS_MOBILE : STAGE_REVEAL_LOCK_MS_DESKTOP;
  const isStageRevealing = useStageRevealPhase(stageRevealCycleKey, stageRevealLockMs);

  if (!currentStage) {
    return null;
  }

  const isMultiSelect = currentStage.allowsMultipleSelections === true;
  const selectedActionIds = pendingActionIds ?? (isMultiSelect ? selectedMultiActionIds : currentPlayerActionIds);
  const isSubmitting = pendingActionIds !== null;
  const canChangeAnswer = party.settings.allowOptionChangeAfterVoting && !isStageTimerExpired;
  const isLocked = currentPlayerAction !== null && !canChangeAnswer;
  const areActionsDisabled =
    party.status !== PartyStatus.ACTIVE || isSubmitting || isLocked || isStageTimerExpired || isStageRevealing;
  const shortcutScope = `${testIdPrefix}-player-stage-shortcuts`;

  useShortcutScope(shortcutScope, { active: true, priority: 100 });

  const actionItems = currentStage.actions.map((action, index) => {
    const isSelected = selectedActionIds.includes(action.id);
    const shortcutNumber = index < MAX_SHORTCUT_ACTION_COUNT ? index + 1 : null;

    return {
      actionId: action.id,
      index,
      isSelected,
      shortcutNumber,
      testId: `${testIdPrefix}-player-stage-action-${resolvePlayableChoiceActionSlotLabel(index).toLowerCase()}`,
      text: action.text,
    };
  });

  const renderActionTile = (item: (typeof actionItems)[number]) => (
    <PlayableChoiceResultActionTile
      copy={copy}
      disabled={areActionsDisabled}
      fillParent={isMobile}
      index={item.index}
      isCorrect={false}
      ariaKeyShortcuts={item.shortcutNumber ? String(item.shortcutNumber) : undefined}
      isSelected={item.isSelected}
      onClick={() => onSelectAction(item.actionId)}
      slotCount={currentStage.actions.length}
      testId={item.testId}
      text={item.text}
    />
  );
  const onSelectAction = (actionId: PartyActionId) => {
    if (!isMultiSelect) {
      onSubmitAction([actionId]);
      return;
    }

    setMultiSelection((selection) => {
      const selected = selection.stageId === stageId ? selection.actionIds : currentPlayerActionIds;

      return {
        actionIds: selected.includes(actionId)
          ? selected.filter((selectedId) => selectedId !== actionId)
          : [...selected, actionId],
        stageId,
      };
    });
  };

  return (
    <PlayerStageSurfaceFrame
      contentGap={isMobile ? 'sm' : 'md'}
      isLocked={isLocked}
      isSubmitting={isSubmitting}
      lockedLabel={t(copy.responseLocked)}
      mobileTimer={{
        isPaused: party.status === PartyStatus.PAUSED,
        remainingDurationMs,
        totalDurationMs,
      }}
      onLeaveParty={onLeaveParty}
      party={party}
      playerActionErrorMessage={playerActionErrorMessage}
      stageAside={
        <StageCountdownTimer
          isPaused={party.status === PartyStatus.PAUSED}
          remainingDurationMs={remainingDurationMs}
          size={isMobile ? 'sm' : 'md'}
          testId={`${testIdPrefix}-player-stage-timer`}
          totalDurationMs={totalDurationMs}
        />
      }
      submittingLabel={t('game.party.player.route.actionSubmitting')}
      testId={`${testIdPrefix}-player-stage-surface`}
    >
      {actionItems.map((item) =>
        item.shortcutNumber ? (
          <PlayableChoiceActionShortcutRegistration
            actionId={item.actionId}
            enabled={!areActionsDisabled}
            key={`shortcut-${item.actionId}`}
            onSelectAction={onSelectAction}
            scope={shortcutScope}
            shortcutNumber={item.shortcutNumber}
          />
        ) : null,
      )}
      {isMultiSelect ? <SupportingText>{t(copy.selectAnswersHint)}</SupportingText> : null}
      {isMobile ? (
        <MotionStagger
          key={`answers-${stageRevealCycleKey ?? 'none'}`}
          initialDelay={STAGE_ANSWER_REVEAL_INITIAL_DELAY_SECONDS_MOBILE}
          staggerDelay={STAGE_ANSWER_REVEAL_STAGGER_SECONDS_MOBILE}
          style={resolveMobileGridStyle(currentStage.actions.length)}
        >
          {actionItems.map((item) => (
            <MotionStaggerItem key={item.actionId} style={mobileTileWrapperStyle}>
              {renderActionTile(item)}
            </MotionStaggerItem>
          ))}
        </MotionStagger>
      ) : (
        <MotionStagger
          key={`answers-${stageRevealCycleKey ?? 'none'}`}
          initialDelay={STAGE_ANSWER_REVEAL_INITIAL_DELAY_SECONDS_DESKTOP}
          staggerDelay={STAGE_ANSWER_REVEAL_STAGGER_SECONDS_DESKTOP}
        >
          <ResponsiveGrid columns={{ base: 2 }} gap="md">
            {actionItems.map((item) => (
              <MotionStaggerItem key={item.actionId}>{renderActionTile(item)}</MotionStaggerItem>
            ))}
          </ResponsiveGrid>
        </MotionStagger>
      )}
      {isMultiSelect ? (
        <Button
          disabled={areActionsDisabled || selectedMultiActionIds.length === 0}
          onClick={() => onSubmitAction(selectedMultiActionIds)}
          width="full"
        >
          {t(copy.submitAnswers)}
        </Button>
      ) : null}
    </PlayerStageSurfaceFrame>
  );
}

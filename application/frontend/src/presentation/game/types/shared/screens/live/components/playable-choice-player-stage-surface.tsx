import type { CSSProperties } from 'react';
import type { PartyActionId } from '../../../../../../../domains/game/party/shared/entities/party-action';
import { PartyStatus } from '../../../../../../../domains/game/party/shared/entities/party-status';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { useKeyboardShortcut, useShortcutScope } from '../../../../../../shared/keyboard';
import { ResponsiveGrid } from '../../../../../../shared/ui/layout/containers';
import { usePresentationMediaQuery } from '../../../../../../shared/ui/layout/use-presentation-media-query';
import {
  MotionStagger,
  MotionStaggerItem,
} from '../../../../../../shared/ui/motion/motion-primitives';
import { PlayerStageSurfaceFrame } from '../../../../../party/player/screens/components/player-stage-surface-frame';
import { resolvePlayableChoiceActionSlotLabel } from './playable-choice-action-slot-identity';
import { PlayableChoiceResultActionTile } from './playable-choice-result-action-tile';
import type { PlayableChoicePlayerStageSurfaceProps } from './playable-choice-runtime-panel.types';
import { StageCountdownTimer } from './stage-countdown-timer';
import {
  resolveStageTotalDurationMs,
  useStageRemainingDurationMs,
} from './use-stage-remaining-duration-ms';
import { useStageRevealPhase } from './use-stage-reveal-phase';

const STAGE_ANSWER_REVEAL_INITIAL_DELAY_SECONDS_DESKTOP = 1.8;
const STAGE_ANSWER_REVEAL_STAGGER_SECONDS_DESKTOP = 0.22;
const STAGE_REVEAL_LOCK_MS_DESKTOP = 2_800;
const STAGE_ANSWER_REVEAL_INITIAL_DELAY_SECONDS_MOBILE = 1.4;
const STAGE_ANSWER_REVEAL_STAGGER_SECONDS_MOBILE = 0.18;
const STAGE_REVEAL_LOCK_MS_MOBILE = 0;
const MAX_SHORTCUT_ACTION_COUNT = 9;

const mobileGridBaseStyle: CSSProperties = {
  display: 'grid',
  flex: '1 1 auto',
  gap: '0.5rem',
  gridTemplateColumns: '1fr 1fr',
  minHeight: 0,
  width: '100%',
};

const mobileTileWrapperStyle: CSSProperties = {
  display: 'flex',
  minHeight: 0,
};

function resolveMobileGridStyle(actionCount: number): CSSProperties {
  // 2 columns; rows auto-distribute remaining height into equal fractions so
  // 4, 5, 6, 7, or 8 options all share the viewport with no scroll.
  const rowCount = Math.max(1, Math.ceil(actionCount / 2));
  return {
    ...mobileGridBaseStyle,
    gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))`,
  };
}

function PlayableChoiceActionShortcutRegistration({
  actionId,
  enabled,
  onSubmitAction,
  scope,
  shortcutNumber,
}: {
  readonly actionId: PartyActionId;
  readonly enabled: boolean;
  readonly onSubmitAction: PlayableChoicePlayerStageSurfaceProps['onSubmitAction'];
  readonly scope: string;
  readonly shortcutNumber: number;
}) {
  useKeyboardShortcut({
    ariaKeyShortcuts: String(shortcutNumber),
    combo: { key: String(shortcutNumber) },
    descriptionKey: 'game.party.player.route.answerShortcut',
    descriptionVariables: { number: String(shortcutNumber) },
    disabled: !enabled,
    execute: () => onSubmitAction(actionId),
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
  pendingActionId,
  playerActionErrorMessage,
  testIdPrefix,
}: PlayableChoicePlayerStageSurfaceProps) {
  const { t } = usePresentationTranslation();
  const isMobile = usePresentationMediaQuery();
  const currentStage = party.context?.stage?.current;
  const stageId = party.context?.lifecycle.stageId ?? null;
  const stageEndsAtEpochMs = party.context?.lifecycle.stageEndsAtEpochMs ?? null;
  const stageRevealCycleKey =
    stageId === null ? null : `${stageId}-${stageEndsAtEpochMs ?? 'no-deadline'}`;
  const currentPlayerAction = party.context?.stage?.actionSubmission?.currentPlayer ?? null;
  const remainingDurationMs = useStageRemainingDurationMs(party);
  const totalDurationMs = resolveStageTotalDurationMs(party);
  const isStageTimerExpired = remainingDurationMs === 0;
  const stageRevealLockMs = isMobile ? STAGE_REVEAL_LOCK_MS_MOBILE : STAGE_REVEAL_LOCK_MS_DESKTOP;
  const isStageRevealing = useStageRevealPhase(stageRevealCycleKey, stageRevealLockMs);

  if (!currentStage) {
    return null;
  }

  const selectedActionId = currentPlayerAction?.selectedActionId ?? pendingActionId;
  const isSubmitting = pendingActionId !== null && currentPlayerAction === null;
  const isLocked = currentPlayerAction !== null;
  const areActionsDisabled =
    party.status !== PartyStatus.ACTIVE ||
    isSubmitting ||
    isLocked ||
    isStageTimerExpired ||
    isStageRevealing;
  const shortcutScope = `${testIdPrefix}-player-stage-shortcuts`;

  useShortcutScope(shortcutScope, { active: true, priority: 100 });

  const actionItems = currentStage.actions.map((action, index) => {
    const isSelected = selectedActionId === action.id;
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
      onClick={() => onSubmitAction(item.actionId)}
      slotCount={currentStage.actions.length}
      testId={item.testId}
      text={item.text}
    />
  );

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
            onSubmitAction={onSubmitAction}
            scope={shortcutScope}
            shortcutNumber={item.shortcutNumber}
          />
        ) : null,
      )}
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
    </PlayerStageSurfaceFrame>
  );
}

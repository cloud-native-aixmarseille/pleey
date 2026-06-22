import type { ReactNode } from 'react';
import type { PartyObservation } from '../../../../../../domains/game/party/shared/entities/party-observation';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { ContentStack, SplitWrapRow } from '../../../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../../../shared/ui/layout/panels';
import { Heading, SupportingText } from '../../../../../shared/ui/layout/typography';
import { usePresentationMediaQuery } from '../../../../../shared/ui/layout/use-presentation-media-query';
import { MotionFadeIn, MotionPresence } from '../../../../../shared/ui/motion/motion-primitives';
import { PlayerPartyStatusBar } from './player-party-status-bar';
import { PlayerRuntimeMobileMenu } from './player-runtime-mobile-menu';
import {
  MOBILE_TIMER_BAR_HEIGHT_PX,
  type MobileStageTimer,
  mobileActionsAreaStyle,
  mobileQuestionStyle,
  mobileQuestionTextStyle,
  mobileRootStyle,
  mobileTimerBarTrackStyle,
  mobileTimerInlineStyle,
  resolveMobileTimerBarStyle,
} from './player-stage-surface-frame.styles';

const MOBILE_TIMER_BAR_WARNING_THRESHOLD_RATIO = 0.5;
const MOBILE_TIMER_BAR_CRITICAL_THRESHOLD_RATIO = 0.2;
const MOBILE_TIMER_INLINE_THRESHOLD_SECONDS = 10;

interface PlayerStageSurfaceFrameProps {
  readonly children: ReactNode;
  readonly contentGap?: 'sm' | 'md' | 'lg';
  readonly isLocked: boolean;
  readonly isSubmitting: boolean;
  readonly lockedLabel: string;
  readonly mobileTimer?: MobileStageTimer;
  readonly onLeaveParty: () => void;
  readonly party: PartyObservation;
  readonly playerActionErrorMessage: string | null;
  readonly stageAside?: ReactNode;
  readonly submittingLabel: string;
  readonly testId: string;
}

function resolveInlineTimerColor(timer: MobileStageTimer | undefined): string | null {
  if (!timer || timer.remainingDurationMs === null || timer.totalDurationMs === null) {
    return null;
  }

  if (timer.isPaused) {
    return 'var(--mantine-color-gray-7)';
  }

  const ratio = timer.totalDurationMs > 0 ? timer.remainingDurationMs / timer.totalDurationMs : 1;
  if (ratio <= MOBILE_TIMER_BAR_CRITICAL_THRESHOLD_RATIO) {
    return 'var(--mantine-color-red-7)';
  }
  if (ratio <= MOBILE_TIMER_BAR_WARNING_THRESHOLD_RATIO) {
    return 'var(--mantine-color-yellow-8)';
  }
  return 'var(--mantine-color-teal-8)';
}

export function PlayerStageSurfaceFrame({
  children,
  contentGap = 'md',
  isLocked,
  isSubmitting,
  lockedLabel,
  mobileTimer,
  onLeaveParty,
  party,
  playerActionErrorMessage,
  stageAside,
  submittingLabel,
  testId,
}: PlayerStageSurfaceFrameProps) {
  const { t } = usePresentationTranslation();
  const stagePosition = party.context?.lifecycle.stagePosition;
  const stageId = party.context?.lifecycle.stageId ?? null;
  const stageEndsAtEpochMs = party.context?.lifecycle.stageEndsAtEpochMs ?? null;
  const stageRevealCycleKey =
    stageId === null ? 'none' : `${stageId}-${stageEndsAtEpochMs ?? 'no-deadline'}`;
  const currentStage = party.context?.stage?.current;
  const isMobile = usePresentationMediaQuery();

  if (!currentStage || stagePosition === null || stagePosition === undefined) {
    return null;
  }

  const totalStages = party.context?.lifecycle.totalStages ?? stagePosition + 1;
  const progressText = t('game.party.route.runtimeStageProgress', {
    current: String(stagePosition + 1),
    total: String(totalStages),
  });

  const errorBanner = (
    <MotionPresence>
      {playerActionErrorMessage ? (
        <MotionFadeIn key="player-action-error">
          <StatusBanner tone="error">{t(playerActionErrorMessage)}</StatusBanner>
        </MotionFadeIn>
      ) : null}
    </MotionPresence>
  );

  const submissionBanners = (
    <MotionPresence>
      {isSubmitting ? (
        <MotionFadeIn key="submitting-banner">
          <StatusBanner tone="success">{submittingLabel}</StatusBanner>
        </MotionFadeIn>
      ) : null}

      {isLocked ? (
        <MotionFadeIn key="locked-banner">
          <StatusBanner tone="success">{lockedLabel}</StatusBanner>
        </MotionFadeIn>
      ) : null}
    </MotionPresence>
  );

  if (isMobile) {
    const { fill: timerFillStyle, secondsLeft } = resolveMobileTimerBarStyle(mobileTimer);
    const inlineTimerColor = resolveInlineTimerColor(mobileTimer);
    const shouldShowInlineSeconds =
      secondsLeft !== null &&
      secondsLeft > 0 &&
      secondsLeft <= MOBILE_TIMER_INLINE_THRESHOLD_SECONDS;

    return (
      <div data-testid={testId} style={mobileRootStyle}>
        <div aria-hidden style={mobileTimerBarTrackStyle}>
          <div style={timerFillStyle} />
        </div>

        <PlayerRuntimeMobileMenu
          ariaLabel={t('game.party.player.route.stageMenuLabel')}
          cancelLeaveLabel={t('game.party.player.route.cancelLeavePartyCta')}
          confirmLeaveLabel={t('game.party.player.route.confirmLeavePartyCta')}
          inlineStatus={
            shouldShowInlineSeconds && inlineTimerColor ? (
              <span style={{ ...mobileTimerInlineStyle, color: inlineTimerColor }}>
                {secondsLeft}
              </span>
            ) : undefined
          }
          leaveDialogMessage={t('game.party.player.route.leavePartyConfirmMessage')}
          leaveDialogTitle={t('game.party.player.route.leavePartyConfirmTitle')}
          leaveLabel={t('game.party.player.route.leavePartyCta')}
          menuLabel={progressText}
          onLeaveParty={onLeaveParty}
          timerBarHeightPx={MOBILE_TIMER_BAR_HEIGHT_PX}
          timerSlot={stageAside}
        />

        {errorBanner}

        <MotionFadeIn key={`question-${stageRevealCycleKey}`} duration={0.9}>
          <div style={mobileQuestionStyle}>
            <p style={mobileQuestionTextStyle}>{currentStage.text}</p>
          </div>
        </MotionFadeIn>

        <div style={mobileActionsAreaStyle}>{children}</div>

        {submissionBanners}
      </div>
    );
  }

  return (
    <div data-testid={testId}>
      <ContentStack gap="lg">
        <PlayerPartyStatusBar onLeaveParty={onLeaveParty} party={party} variant="paused-only" />

        {errorBanner}

        <InsetPanel padding="lg">
          <ContentStack gap={contentGap}>
            <SplitWrapRow align="center" gap="sm">
              <SupportingText tone="soft">{progressText}</SupportingText>
              {stageAside}
            </SplitWrapRow>

            <MotionFadeIn key={`question-${stageRevealCycleKey}`} duration={1.0}>
              <Heading level={3}>{currentStage.text}</Heading>
            </MotionFadeIn>

            {children}

            {submissionBanners}
          </ContentStack>
        </InsetPanel>
      </ContentStack>
    </div>
  );
}

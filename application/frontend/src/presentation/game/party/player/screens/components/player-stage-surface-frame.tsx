import type { CSSProperties, ReactNode } from 'react';
import type { PartyObservation } from '../../../../../../domains/game/party/shared/entities/party-observation';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import { ContentStack, SplitWrapRow } from '../../../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../../../shared/ui/layout/panels';
import { Heading, SupportingText } from '../../../../../shared/ui/layout/typography';
import { usePresentationMediaQuery } from '../../../../../shared/ui/layout/use-presentation-media-query';
import { MotionFadeIn, MotionPresence } from '../../../../../shared/ui/motion/motion-primitives';
import { PlayerRuntimeMobileMenu } from '../../../shared/screens/components/player-runtime-mobile-menu';
import { PlayerPartyStatusBar } from './player-party-status-bar';

const MOBILE_TIMER_BAR_HEIGHT_PX = 4;
const MOBILE_TIMER_BAR_WARNING_THRESHOLD_RATIO = 0.5;
const MOBILE_TIMER_BAR_CRITICAL_THRESHOLD_RATIO = 0.2;
const MOBILE_TIMER_INLINE_THRESHOLD_SECONDS = 10;

const mobileRootStyle: CSSProperties = {
  background: uiThemeTokens.color.surface.canvas,
  bottom: 0,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  left: 0,
  overflow: 'hidden',
  paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
  paddingLeft: 'max(0.5rem, env(safe-area-inset-left))',
  paddingRight: 'max(0.5rem, env(safe-area-inset-right))',
  paddingTop: `calc(${MOBILE_TIMER_BAR_HEIGHT_PX}px + max(0.5rem, env(safe-area-inset-top)))`,
  position: 'fixed',
  right: 0,
  top: 0,
  zIndex: 200,
};

const mobileTimerBarTrackStyle: CSSProperties = {
  background: uiThemeTokens.color.surface.recessed,
  height: `${MOBILE_TIMER_BAR_HEIGHT_PX}px`,
  left: 0,
  position: 'absolute',
  right: 0,
  top: 0,
  zIndex: 4,
};

const mobileTimerBarFillBaseStyle: CSSProperties = {
  height: '100%',
  transition: 'width 250ms linear, background 250ms linear',
};

const mobileTimerInlineStyle: CSSProperties = {
  fontVariantNumeric: 'tabular-nums',
  fontWeight: 700,
  lineHeight: 1,
};

const mobileQuestionStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flex: '0 1 auto',
  justifyContent: 'center',
  maxHeight: '46dvh',
  minHeight: 0,
  overflowY: 'auto',
  paddingRight: '2.75rem',
};

const mobileQuestionTextStyle: CSSProperties = {
  display: 'block',
  fontSize: '1.375rem',
  fontWeight: 700,
  lineHeight: 1.3,
  margin: 0,
  textAlign: 'center',
};

const mobileActionsAreaStyle: CSSProperties = {
  display: 'flex',
  flex: '1 1 auto',
  flexDirection: 'column',
  minHeight: 0,
};

interface MobileStageTimer {
  readonly isPaused: boolean;
  readonly remainingDurationMs: number | null;
  readonly totalDurationMs: number | null;
}

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

function resolveMobileTimerBarStyle(timer: MobileStageTimer | undefined): {
  readonly fill: CSSProperties;
  readonly secondsLeft: number | null;
} {
  if (
    !timer ||
    timer.remainingDurationMs === null ||
    timer.totalDurationMs === null ||
    timer.totalDurationMs <= 0
  ) {
    return { fill: { ...mobileTimerBarFillBaseStyle, width: '0%' }, secondsLeft: null };
  }

  const remaining = Math.max(0, timer.remainingDurationMs);
  const ratio = Math.min(1, Math.max(0, remaining / timer.totalDurationMs));
  const secondsLeft = Math.ceil(remaining / 1000);

  let background: string;
  if (timer.isPaused) {
    background = 'var(--mantine-color-gray-5)';
  } else if (ratio <= MOBILE_TIMER_BAR_CRITICAL_THRESHOLD_RATIO) {
    background = 'var(--mantine-color-red-6)';
  } else if (ratio <= MOBILE_TIMER_BAR_WARNING_THRESHOLD_RATIO) {
    background = 'var(--mantine-color-yellow-6)';
  } else {
    background = 'var(--mantine-color-teal-6)';
  }

  return {
    fill: {
      ...mobileTimerBarFillBaseStyle,
      background,
      width: `${ratio * 100}%`,
    },
    secondsLeft,
  };
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

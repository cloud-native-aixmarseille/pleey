import type { CSSProperties } from 'react';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';

export const MOBILE_TIMER_BAR_HEIGHT_PX = 4;
const MOBILE_TIMER_BAR_WARNING_THRESHOLD_RATIO = 0.5;
const MOBILE_TIMER_BAR_CRITICAL_THRESHOLD_RATIO = 0.2;

export interface MobileStageTimer {
  readonly isPaused: boolean;
  readonly remainingDurationMs: number | null;
  readonly totalDurationMs: number | null;
}

export const mobileRootStyle: CSSProperties = {
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

export const mobileTimerBarTrackStyle: CSSProperties = {
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

export const mobileTimerInlineStyle: CSSProperties = {
  fontVariantNumeric: 'tabular-nums',
  fontWeight: 700,
  lineHeight: 1,
};

export const mobileQuestionStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flex: '0 1 auto',
  justifyContent: 'center',
  maxHeight: '46dvh',
  minHeight: 0,
  overflowY: 'auto',
  paddingRight: '2.75rem',
};

export const mobileQuestionTextStyle: CSSProperties = {
  display: 'block',
  fontSize: '1.375rem',
  fontWeight: 700,
  lineHeight: 1.3,
  margin: 0,
  textAlign: 'center',
};

export const mobileActionsAreaStyle: CSSProperties = {
  display: 'flex',
  flex: '1 1 auto',
  flexDirection: 'column',
  minHeight: 0,
};

export function resolveMobileTimerBarStyle(timer: MobileStageTimer | undefined): {
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

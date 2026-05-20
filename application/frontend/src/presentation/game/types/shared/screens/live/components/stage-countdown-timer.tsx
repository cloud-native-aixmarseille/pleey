import { useEffect, useState } from 'react';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';

type StageCountdownTone = 'normal' | 'warning' | 'critical' | 'expired' | 'paused';

interface StageCountdownTimerProps {
  readonly isPaused: boolean;
  readonly remainingDurationMs: number | null;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly testId?: string;
  readonly totalDurationMs: number | null;
}

interface ToneDescriptor {
  readonly accent: string;
  readonly accentSoft: string;
  readonly digitColor: string;
  readonly trackColor: string;
}

const RING_RADIUS = 42;
const RING_STROKE = 8;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const RING_VIEWBOX = 100;
const RING_CENTER = RING_VIEWBOX / 2;
const VISUALLY_HIDDEN_STYLE = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute' as const,
  whiteSpace: 'nowrap' as const,
  width: '1px',
};

const SIZE_PIXELS: Record<NonNullable<StageCountdownTimerProps['size']>, number> = {
  lg: 144,
  md: 112,
  sm: 88,
};

const TONE_DESCRIPTORS: Record<StageCountdownTone, ToneDescriptor> = {
  critical: {
    accent: 'var(--mantine-color-red-6)',
    accentSoft: 'var(--mantine-color-red-1)',
    digitColor: 'var(--mantine-color-red-7)',
    trackColor: 'var(--mantine-color-red-1)',
  },
  expired: {
    accent: 'var(--mantine-color-red-7)',
    accentSoft: 'var(--mantine-color-red-2)',
    digitColor: 'var(--mantine-color-red-8)',
    trackColor: 'var(--mantine-color-red-2)',
  },
  normal: {
    accent: 'var(--mantine-color-teal-6)',
    accentSoft: 'var(--mantine-color-teal-1)',
    digitColor: 'var(--mantine-color-teal-8)',
    trackColor: 'var(--mantine-color-gray-2)',
  },
  paused: {
    accent: 'var(--mantine-color-gray-5)',
    accentSoft: 'var(--mantine-color-gray-1)',
    digitColor: 'var(--mantine-color-gray-7)',
    trackColor: 'var(--mantine-color-gray-2)',
  },
  warning: {
    accent: 'var(--mantine-color-yellow-6)',
    accentSoft: 'var(--mantine-color-yellow-1)',
    digitColor: 'var(--mantine-color-yellow-8)',
    trackColor: 'var(--mantine-color-gray-2)',
  },
};

const pulseToggleIntervalMs = 600;

function formatRemainingDuration(remainingDurationMs: number): string {
  const totalRemainingSeconds = Math.ceil(remainingDurationMs / 1000);
  const minutes = Math.floor(totalRemainingSeconds / 60);
  const seconds = totalRemainingSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function resolveTone(
  remainingDurationMs: number,
  totalDurationMs: number,
  isPaused: boolean,
): StageCountdownTone {
  if (remainingDurationMs <= 0) {
    return 'expired';
  }

  if (isPaused) {
    return 'paused';
  }

  const ratio = totalDurationMs > 0 ? remainingDurationMs / totalDurationMs : 1;
  const totalRemainingSeconds = Math.ceil(remainingDurationMs / 1000);

  if (ratio <= 0.2 || totalRemainingSeconds <= 5) {
    return 'critical';
  }

  if (ratio <= 0.5) {
    return 'warning';
  }

  return 'normal';
}

function resolveProgressRatio(remainingDurationMs: number, totalDurationMs: number): number {
  if (totalDurationMs <= 0) {
    return 0;
  }

  if (remainingDurationMs <= 0) {
    return 1;
  }

  const elapsed = totalDurationMs - remainingDurationMs;
  const ratio = elapsed / totalDurationMs;

  return Math.min(1, Math.max(0, ratio));
}

function useCriticalPulse(isCritical: boolean): boolean {
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (!isCritical) {
      setIsPulsing(false);
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setIsPulsing((previous) => !previous);
    }, pulseToggleIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [isCritical]);

  return isPulsing;
}

export function StageCountdownTimer({
  isPaused,
  remainingDurationMs,
  size = 'md',
  testId,
  totalDurationMs,
}: StageCountdownTimerProps) {
  const { t } = usePresentationTranslation();

  const isCriticalTone =
    remainingDurationMs !== null &&
    totalDurationMs !== null &&
    !isPaused &&
    resolveTone(remainingDurationMs, totalDurationMs, false) === 'critical' &&
    remainingDurationMs > 0;

  const isPulsing = useCriticalPulse(isCriticalTone);

  if (remainingDurationMs === null || totalDurationMs === null) {
    return null;
  }

  const tone = resolveTone(remainingDurationMs, totalDurationMs, isPaused);
  const toneDescriptor = TONE_DESCRIPTORS[tone];
  const progressRatio = resolveProgressRatio(remainingDurationMs, totalDurationMs);
  const dashOffset = RING_CIRCUMFERENCE * (1 - progressRatio);
  const formattedTime = formatRemainingDuration(remainingDurationMs);
  const isExpired = remainingDurationMs <= 0;
  const dimensionPx = SIZE_PIXELS[size];
  const liveAnnouncement = isExpired
    ? t('game.party.route.runtimeTimeUp')
    : isPaused
      ? t('game.party.status.paused')
      : null;

  const ariaLabel = isExpired
    ? t('game.party.route.runtimeTimeUp')
    : t('game.party.route.runtimeTimeLeft', { time: formattedTime });

  const subLabel = isExpired
    ? t('game.party.route.runtimeTimeUp')
    : t('game.party.route.runtimeTimeLeft', { time: formattedTime });

  return (
    <div
      aria-label={ariaLabel}
      aria-live="off"
      data-testid={testId}
      data-tone={tone}
      role="group"
      style={{
        alignItems: 'center',
        display: 'inline-flex',
        flexDirection: 'column',
        gap: 'var(--mantine-spacing-xs)',
      }}
    >
      {liveAnnouncement ? (
        <span aria-atomic="true" role="status" style={VISUALLY_HIDDEN_STYLE}>
          {liveAnnouncement}
        </span>
      ) : null}
      <div
        style={{
          height: dimensionPx,
          position: 'relative',
          transform: isPulsing ? 'scale(1.06)' : 'scale(1)',
          transition: 'transform 600ms ease-in-out',
          width: dimensionPx,
        }}
      >
        <svg
          aria-hidden="true"
          focusable="false"
          height={dimensionPx}
          style={{ display: 'block', transform: 'rotate(-90deg)' }}
          viewBox={`0 0 ${RING_VIEWBOX} ${RING_VIEWBOX}`}
          width={dimensionPx}
        >
          <circle
            cx={RING_CENTER}
            cy={RING_CENTER}
            fill={toneDescriptor.accentSoft}
            r={RING_RADIUS - RING_STROKE / 2}
          />
          <circle
            cx={RING_CENTER}
            cy={RING_CENTER}
            fill="none"
            r={RING_RADIUS}
            stroke={toneDescriptor.trackColor}
            strokeWidth={RING_STROKE}
          />
          <circle
            cx={RING_CENTER}
            cy={RING_CENTER}
            fill="none"
            r={RING_RADIUS}
            stroke={toneDescriptor.accent}
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            strokeWidth={RING_STROKE}
            style={{ transition: 'stroke-dashoffset 250ms linear, stroke 250ms ease-out' }}
          />
        </svg>
        <div
          aria-hidden="true"
          style={{
            alignItems: 'center',
            color: toneDescriptor.digitColor,
            display: 'flex',
            fontFamily: 'var(--mantine-font-family-monospace, monospace)',
            fontSize: size === 'lg' ? '2.25rem' : size === 'md' ? '1.75rem' : '1.25rem',
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 700,
            inset: 0,
            justifyContent: 'center',
            letterSpacing: '0.04em',
            lineHeight: 1,
            position: 'absolute',
          }}
        >
          {formattedTime}
        </div>
      </div>
      <span
        aria-hidden="true"
        style={{
          color: toneDescriptor.digitColor,
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {subLabel}
      </span>
    </div>
  );
}

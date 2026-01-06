import { type CSSProperties, type ReactNode } from "react";
import { composeClasses } from "../../utils/composeClasses";

export type ArcadeProgressTone =
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "danger"
  | "warning"
  | "neutral";

export type ArcadeProgressSize = "sm" | "md" | "lg";

export type ArcadeProgressTrackVariant =
  | "default"
  | "timer"
  | "distribution"
  | "host"
  | "results";

export type ArcadeProgressFillPadding = "default" | "results";

const TRACK_BASE_CLASSES = "relative w-full overflow-hidden";

const TRACK_SIZE_MAP: Record<ArcadeProgressSize, string> = {
  sm: "h-2",
  md: "h-4",
  lg: "h-6",
};

const TRACK_DEFAULT_CLASSES =
  "rounded-full border bg-light-200/70 border-primary-200/80 shadow-inner transition-colors dark:bg-dark-700/60 dark:border-dark-600/60";

const TRACK_VARIANT_CLASS_MAP: Record<ArcadeProgressTrackVariant, string> = {
  default: "",
  timer: "h-5 rounded-full border-2 border-dark-600 bg-dark-700",
  distribution: "h-8 rounded-full border border-white/20 bg-dark-700/50",
  host: "h-8 rounded-full border-4 border-dark-600 bg-dark-700 shadow-inner",
  results:
    "h-12 overflow-hidden rounded-2xl border-2 border-white/30 bg-dark-700/60 sm:h-16",
};

const FILL_BASE_CLASSES =
  "h-full bg-gradient-to-r transition-all duration-1000 ease-out origin-left flex items-center justify-end";

const FILL_PADDING_CLASS_MAP: Record<ArcadeProgressFillPadding, string> = {
  default: "px-3",
  results: "px-4 sm:px-6",
};

const FILL_TONE_MAP: Record<ArcadeProgressTone, string> = {
  primary: "from-primary-500 to-secondary-500",
  secondary: "from-secondary-500 to-secondary-300",
  accent: "from-accent-500 to-primary-400",
  success: "from-success-500 to-accent-500",
  danger: "from-danger-600 to-danger-400",
  warning: "from-secondary-600 to-secondary-400",
  neutral: "from-light-400 to-light-200",
};

export interface ArcadeProgressBarProps {
  value: number;
  min?: number;
  max?: number;
  tone?: ArcadeProgressTone;
  size?: ArcadeProgressSize;
  pulse?: boolean;
  animationDelay?: number | string;
  trackVariant?: ArcadeProgressTrackVariant;
  fillPadding?: ArcadeProgressFillPadding;
  ariaLabel?: string;
  children?: ReactNode;
}

export function ArcadeProgressBar({
  value,
  min = 0,
  max = 100,
  tone = "accent",
  size = "md",
  pulse = false,
  animationDelay,
  trackVariant = "default",
  fillPadding = "default",
  ariaLabel,
  children,
}: ArcadeProgressBarProps) {
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) && max !== safeMin ? max : safeMin + 1;
  const clampedValue = Math.min(Math.max(value, safeMin), safeMax);
  const progressPercent =
    ((clampedValue - safeMin) / (safeMax - safeMin)) * 100;

  const trackClassName = composeClasses(
    TRACK_BASE_CLASSES,
    trackVariant === "default" ? TRACK_SIZE_MAP[size] : undefined,
    trackVariant === "default"
      ? TRACK_DEFAULT_CLASSES
      : TRACK_VARIANT_CLASS_MAP[trackVariant]
  );

  const fillClassNames = composeClasses(
    FILL_BASE_CLASSES,
    FILL_TONE_MAP[tone],
    pulse ? "animate-pulse" : undefined,
    FILL_PADDING_CLASS_MAP[fillPadding]
  );

  const computedFillStyle: CSSProperties = {
    width: `${progressPercent}%`,
    ...(animationDelay !== undefined
      ? {
          animationDelay:
            typeof animationDelay === "number"
              ? `${animationDelay}ms`
              : animationDelay,
        }
      : {}),
  };

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={safeMin}
      aria-valuemax={safeMax}
      aria-label={ariaLabel}
      className={trackClassName}
    >
      <div
        className={fillClassNames}
        style={computedFillStyle}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}

export default ArcadeProgressBar;

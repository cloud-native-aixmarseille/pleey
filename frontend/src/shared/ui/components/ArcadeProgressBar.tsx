import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { composeClasses } from "../utils/composeClasses";
import type { StyleEntry } from "../styles/createStyles";

export type ArcadeProgressTone =
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "danger"
  | "warning"
  | "neutral";

export type ArcadeProgressSize = "sm" | "md" | "lg";

const TRACK_BASE_CLASSES =
  "relative w-full overflow-hidden rounded-full border";

const TRACK_SIZE_MAP: Record<ArcadeProgressSize, string> = {
  sm: "h-2",
  md: "h-4",
  lg: "h-6",
};

const TRACK_BG_CLASSES =
  "bg-dark-700/60 border-dark-600/60 shadow-inner transition-colors";

const FILL_BASE_CLASSES =
  "h-full bg-gradient-to-r transition-all duration-1000 ease-out origin-left flex items-center justify-end px-3";

const FILL_TONE_MAP: Record<ArcadeProgressTone, string> = {
  primary: "from-primary-500 to-secondary-500",
  secondary: "from-secondary-500 to-secondary-300",
  accent: "from-accent-500 to-primary-400",
  success: "from-success-500 to-accent-500",
  danger: "from-danger-600 to-danger-400",
  warning: "from-secondary-600 to-secondary-400",
  neutral: "from-light-400 to-light-200",
};

export interface ArcadeProgressBarProps
  extends Omit<ComponentPropsWithoutRef<"div">, "role" | "children"> {
  value: number;
  min?: number;
  max?: number;
  tone?: ArcadeProgressTone;
  size?: ArcadeProgressSize;
  pulse?: boolean;
  animationDelay?: number | string;
  trackSlot?: StyleEntry;
  fillSlot?: StyleEntry;
  fillClassName?: string;
  fillStyle?: CSSProperties;
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
  trackSlot,
  fillSlot,
  fillClassName,
  fillStyle,
  children,
  className,
  ...rest
}: ArcadeProgressBarProps) {
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) && max !== safeMin ? max : safeMin + 1;
  const clampedValue = Math.min(Math.max(value, safeMin), safeMax);
  const progressPercent =
    ((clampedValue - safeMin) / (safeMax - safeMin)) * 100;

  const trackClassName = composeClasses(
    TRACK_BASE_CLASSES,
    TRACK_SIZE_MAP[size],
    TRACK_BG_CLASSES,
    trackSlot?.className,
    className
  );

  const trackStyleId = trackSlot?.["data-style-id"];

  const fillClassNames = composeClasses(
    FILL_BASE_CLASSES,
    FILL_TONE_MAP[tone],
    pulse ? "animate-pulse" : undefined,
    fillSlot?.className,
    fillClassName
  );

  const fillStyleId = fillSlot?.["data-style-id"];

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
    ...(fillStyle ?? {}),
  };

  return (
    <div
      {...rest}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={safeMin}
      aria-valuemax={safeMax}
      className={trackClassName}
      data-style-id={trackStyleId}
    >
      <div
        className={fillClassNames}
        data-style-id={fillStyleId}
        style={computedFillStyle}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}

export default ArcadeProgressBar;

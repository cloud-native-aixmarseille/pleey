import { type ReactNode } from "react";
import { composeClasses } from "../utils/composeClasses";

export type ArcadeBadgeTone =
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "danger"
  | "neutral";

type ArcadeBadgeSize = "xs" | "sm";

const SIZE_CLASS_MAP: Record<ArcadeBadgeSize, string> = {
  xs: "text-[0.65rem] px-3 py-1 gap-1.5",
  sm: "text-xs px-3.5 py-1.5 gap-2",
};

const BASE_CLASSES = composeClasses(
  "inline-flex select-none items-center rounded-full border font-semibold uppercase",
  "tracking-[0.24em] whitespace-nowrap transition-all"
);

const TONE_CLASS_MAP: Record<ArcadeBadgeTone, string> = {
  primary:
    "bg-primary-500/15 text-primary-900 border-primary-500/40 dark:text-primary-100",
  secondary:
    "bg-secondary-500/15 text-secondary-900 border-secondary-500/40 dark:text-secondary-100",
  accent:
    "bg-accent-500/12 text-accent-900 border-accent-500/40 dark:text-accent-100",
  success:
    "bg-success-500/12 text-success-900 border-success-500/35 dark:text-success-100",
  danger:
    "bg-danger-500/12 text-danger-900 border-danger-500/35 dark:text-danger-100",
  neutral:
    "bg-light-100/70 text-dark-500 border-dark-300/40 dark:bg-dark-500/55 dark:text-light-200 dark:border-dark-400/40",
};

function resolveIndicatorClass(pulse: boolean) {
  return composeClasses(
    "inline-block h-2 w-2 rounded-full bg-current",
    pulse ? "animate-pulse" : undefined
  );
}

export interface ArcadeBadgeProps {
  children: ReactNode;
  tone?: ArcadeBadgeTone;
  size?: ArcadeBadgeSize;
  indicator?: boolean;
  pulse?: boolean;
}

export function ArcadeBadge({
  children,
  tone = "primary",
  size = "xs",
  indicator = false,
  pulse = false,
}: ArcadeBadgeProps) {
  return (
    <span
      className={composeClasses(
        BASE_CLASSES,
        SIZE_CLASS_MAP[size],
        TONE_CLASS_MAP[tone]
      )}
      data-arcade-badge="true"
    >
      {indicator ? (
        <span aria-hidden="true" className={resolveIndicatorClass(pulse)} />
      ) : null}
      <span className="flex items-center tracking-[0.24em]">{children}</span>
    </span>
  );
}

export default ArcadeBadge;

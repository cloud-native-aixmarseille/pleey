import { type ReactNode } from "react";
import { composeClasses } from "../utils/composeClasses";

export type ArcadeTimerVariant = "panel" | "chip";
export type ArcadeTimerTone =
  | "success"
  | "warning"
  | "danger"
  | "accent"
  | "neutral";
export type ArcadeTimerSize = "md" | "lg";
export type ArcadeTimerAlign = "start" | "center";

const VARIANT_BASE_CLASS_MAP: Record<ArcadeTimerVariant, string> = {
  panel:
    "flex items-center gap-4 rounded-2xl border-4 px-6 py-4 font-display font-black uppercase tracking-[0.2em] transition-all duration-300",
  chip: "flex items-center gap-3 rounded-2xl px-5 py-2 font-display text-2xl font-black uppercase tracking-[0.15em] transition-all duration-300",
};

const VARIANT_TONE_CLASS_MAP: Record<
  ArcadeTimerVariant,
  Record<ArcadeTimerTone, string>
> = {
  panel: {
    success:
      "border-success-500 bg-success-500/30 text-success-300 shadow-neon-accent",
    warning:
      "border-secondary-500 bg-secondary-500/30 text-secondary-200 shadow-neon-secondary",
    danger:
      "border-danger-500 bg-danger-500/30 text-danger-200 shadow-neon-danger",
    accent:
      "border-accent-500 bg-accent-500/25 text-accent-200 shadow-neon-accent",
    neutral: "border-dark-500 bg-dark-500/40 text-light-200 shadow-neon-accent",
  },
  chip: {
    success: "bg-success-500/15 text-success-200",
    warning: "bg-secondary-500/15 text-secondary-200",
    danger: "bg-danger-500/20 text-danger-200",
    accent: "bg-accent-500/20 text-accent-100",
    neutral: "bg-dark-500/40 text-light-200",
  },
};

const SIZE_VALUE_CLASS_MAP: Record<
  ArcadeTimerVariant,
  Record<ArcadeTimerSize, string>
> = {
  panel: {
    md: "text-5xl sm:text-6xl",
    lg: "text-6xl sm:text-7xl",
  },
  chip: {
    md: "text-3xl",
    lg: "text-4xl",
  },
};

const SIZE_ICON_CLASS_MAP: Record<
  ArcadeTimerVariant,
  Record<ArcadeTimerSize, string>
> = {
  panel: {
    md: "text-4xl sm:text-5xl",
    lg: "text-5xl sm:text-6xl",
  },
  chip: {
    md: "text-2xl",
    lg: "text-3xl",
  },
};

const SIZE_LABEL_CLASS_MAP: Record<
  ArcadeTimerVariant,
  Record<ArcadeTimerSize, string>
> = {
  panel: {
    md: "font-mono text-xs uppercase tracking-wider text-light-200/80",
    lg: "font-mono text-sm uppercase tracking-wider text-light-200/80",
  },
  chip: {
    md: "text-xs font-semibold uppercase tracking-[0.2em] text-light-200/90",
    lg: "text-sm font-semibold uppercase tracking-[0.22em] text-light-200/90",
  },
};

const ALIGN_CLASS_MAP: Record<ArcadeTimerAlign, string> = {
  start: "items-start text-left",
  center: "items-center text-center",
};

export interface ArcadeTimerProps {
  value: ReactNode;
  suffix?: ReactNode;
  label?: ReactNode;
  icon?: ReactNode;
  tone?: ArcadeTimerTone;
  variant?: ArcadeTimerVariant;
  size?: ArcadeTimerSize;
  align?: ArcadeTimerAlign;
  pulse?: boolean;
  className?: string;
  role?: string;
  ariaLabel?: string;
  ariaLive?: "off" | "polite" | "assertive";
  ariaAtomic?: boolean;
}

export function ArcadeTimer({
  value,
  suffix,
  label,
  icon = "⏱️",
  tone = "accent",
  variant = "panel",
  size = "md",
  align = "center",
  pulse = false,
  className,
  role,
  ariaLabel,
  ariaLive,
  ariaAtomic,
}: ArcadeTimerProps) {
  const wrapperClassName = composeClasses(
    VARIANT_BASE_CLASS_MAP[variant],
    VARIANT_TONE_CLASS_MAP[variant][tone],
    ALIGN_CLASS_MAP[align],
    pulse ? "animate-pulse scale-105" : undefined,
    className
  );

  const iconClassName = SIZE_ICON_CLASS_MAP[variant][size];
  const valueClassName = SIZE_VALUE_CLASS_MAP[variant][size];
  const labelClassName = SIZE_LABEL_CLASS_MAP[variant][size];

  return (
    <div
      className={wrapperClassName}
      role={role}
      aria-label={ariaLabel}
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      data-arcade-timer="true"
    >
      {icon ? (
        <span className={iconClassName} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <div className="flex flex-col">
        <span className={valueClassName}>
          {value}
          {suffix ? (
            <span className="ml-1 text-base sm:text-lg">{suffix}</span>
          ) : null}
        </span>
        {label ? <span className={labelClassName}>{label}</span> : null}
      </div>
    </div>
  );
}

export default ArcadeTimer;

import { type ReactNode } from "react";
import { composeClasses } from "../utils/composeClasses";

export type ArcadeGlassStackTone =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral";
export type ArcadeGlassStackWidth = "sm" | "md" | "lg";
export type ArcadeGlassStackAlignment = "left" | "center";
export type ArcadeGlassStackSpacing = "sm" | "md" | "lg";

const WIDTH_CLASS_MAP: Record<ArcadeGlassStackWidth, string> = {
  sm: "max-w-xl",
  md: "max-w-2xl",
  lg: "max-w-4xl",
};

const STACK_SPACING_CLASS_MAP: Record<ArcadeGlassStackSpacing, string> = {
  sm: "space-y-3",
  md: "space-y-4",
  lg: "space-y-6",
};

const ALIGNMENT_CLASS_MAP: Record<ArcadeGlassStackAlignment, string> = {
  left: "items-start text-left",
  center: "items-center text-center",
};

const TITLE_TONE_CLASS_MAP: Record<ArcadeGlassStackTone, string> = {
  primary: "text-primary-900 dark:text-primary-100",
  secondary: "text-secondary-900 dark:text-secondary-100",
  accent: "text-accent-900 dark:text-accent-100",
  neutral: "text-dark-500 dark:text-light-100",
};

const SUBTITLE_TONE_CLASS_MAP: Record<ArcadeGlassStackTone, string> = {
  primary: "text-primary-800 dark:text-primary-200",
  secondary: "text-secondary-800 dark:text-secondary-200",
  accent: "text-accent-800 dark:text-accent-200",
  neutral: "text-dark-400 dark:text-light-400",
};

export interface ArcadeGlassStackProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  titleId?: string;
  tone?: ArcadeGlassStackTone;
  width?: ArcadeGlassStackWidth;
  align?: ArcadeGlassStackAlignment;
  spacing?: ArcadeGlassStackSpacing;
  children: ReactNode;
}

export function ArcadeGlassStack({
  title,
  subtitle,
  eyebrow,
  titleId,
  tone = "neutral",
  width = "md",
  align = "left",
  spacing = "md",
  children,
}: ArcadeGlassStackProps) {
  return (
    <section
      className={composeClasses(
        "w-full mx-auto flex flex-col gap-4",
        WIDTH_CLASS_MAP[width]
      )}
      data-arcade-glass-stack="true"
      aria-labelledby={titleId}
    >
      {(eyebrow || title || subtitle) && (
        <header
          className={composeClasses(
            "flex flex-col gap-1",
            ALIGNMENT_CLASS_MAP[align]
          )}
        >
          {eyebrow ? (
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-dark-400 dark:text-light-500">
              {eyebrow}
            </span>
          ) : null}
          {title ? (
            <h3
              id={titleId}
              className={composeClasses(
                "font-display text-2xl sm:text-3xl uppercase tracking-[0.3em]",
                TITLE_TONE_CLASS_MAP[tone]
              )}
            >
              {title}
            </h3>
          ) : null}
          {subtitle ? (
            <p
              className={composeClasses(
                "text-sm font-medium",
                SUBTITLE_TONE_CLASS_MAP[tone]
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </header>
      )}

      <div
        className={composeClasses(
          "flex flex-col",
          STACK_SPACING_CLASS_MAP[spacing]
        )}
      >
        {children}
      </div>
    </section>
  );
}

export default ArcadeGlassStack;

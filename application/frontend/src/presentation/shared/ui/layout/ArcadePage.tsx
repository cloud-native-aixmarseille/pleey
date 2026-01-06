import { type CSSProperties, type ReactNode } from "react";
import { composeClasses } from "../../utils/composeClasses";

type ArcadePageVariant = "gradient" | "dark";

type ArcadePagePadding = "sm" | "md" | "lg";

type ArcadePageWidth = "sm" | "md" | "lg" | "xl" | "full";

type ArcadePageGap = "none" | "sm" | "md" | "lg";

type ArcadePageAlign = "start" | "center";

type ArcadePageVerticalAlign = "start" | "center";

const VARIANT_CLASS_MAP: Record<ArcadePageVariant, string> = {
  gradient: "bg-game-gradient",
  dark: "bg-light-100 dark:bg-dark-500",
};

const PADDING_X_CLASS_MAP: Record<ArcadePagePadding, string> = {
  sm: "px-4 sm:px-6",
  md: "px-6 sm:px-10",
  lg: "px-8 sm:px-16",
};

const PADDING_Y_CLASS_MAP: Record<ArcadePagePadding, string> = {
  sm: "py-6",
  md: "py-10",
  lg: "py-16",
};

const CONTENT_WIDTH_CLASS_MAP: Record<ArcadePageWidth, string> = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

const GAP_CLASS_MAP: Record<ArcadePageGap, string> = {
  none: "gap-0",
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
};

const ALIGN_CLASS_MAP: Record<ArcadePageAlign, string> = {
  start: "items-stretch text-left",
  center: "items-center text-center",
};

const VERTICAL_ALIGN_MAP: Record<ArcadePageVerticalAlign, string> = {
  start: "items-start",
  center: "items-center",
};

type GlowDescription = {
  className: string;
  animationDelay?: string;
};

const GLOW_VARIANTS: Record<ArcadePageVariant, GlowDescription[]> = {
  gradient: [
    {
      className:
        "absolute top-16 left-10 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl animate-float",
    },
    {
      className:
        "absolute bottom-20 right-12 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-float",
      animationDelay: "0.3s",
    },
  ],
  dark: [
    {
      className:
        "absolute top-0 left-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow",
    },
    {
      className:
        "absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse-slow",
      animationDelay: "0.5s",
    },
    {
      className:
        "absolute top-1/2 left-1/2 w-[520px] h-[520px] -translate-x-1/2 -translate-y-1/2 bg-primary-500/5 rounded-full blur-3xl animate-pulse-slow",
      animationDelay: "1s",
    },
  ],
};

export interface ArcadePageProps {
  children: ReactNode;
  variant?: ArcadePageVariant;
  padding?: ArcadePagePadding;
  disableVerticalPadding?: boolean;
  fitViewport?: boolean;
  contentWidth?: ArcadePageWidth;
  gap?: ArcadePageGap;
  align?: ArcadePageAlign;
  verticalAlign?: ArcadePageVerticalAlign;
  overlays?: ReactNode;
}

export function ArcadePage({
  children,
  variant = "gradient",
  padding = "md",
  disableVerticalPadding = false,
  fitViewport = false,
  contentWidth = "lg",
  gap = "lg",
  align = "start",
  verticalAlign = "start",
  overlays,
}: ArcadePageProps) {
  const glowConfiguration = GLOW_VARIANTS[variant];

  const viewportHeightClass = fitViewport
    ? "h-[calc(100dvh-var(--app-shell-padding-top,0px)-var(--app-shell-padding-bottom,0px))]"
    : "min-h-[calc(100dvh-var(--app-shell-padding-top,0px)-var(--app-shell-padding-bottom,0px))]";

  return (
    <div
      className={composeClasses(
        "relative overflow-hidden",
        viewportHeightClass,
        VARIANT_CLASS_MAP[variant]
      )}
      data-arcade-page="true"
    >
      <div
        className="absolute inset-0 bg-grid bg-grid-size opacity-20 pointer-events-none"
        aria-hidden
      />

      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {glowConfiguration.map(({ className, animationDelay }, index) => {
          const style: CSSProperties | undefined = animationDelay
            ? { animationDelay }
            : undefined;
          return (
            <div key={`glow-${index}`} className={className} style={style} />
          );
        })}
      </div>

      <div
        className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none"
        aria-hidden
      />

      {overlays ? (
        <div className="pointer-events-none absolute inset-0 z-30">
          {overlays}
        </div>
      ) : null}

      <div
        className={composeClasses(
          "relative z-20 flex w-full",
          viewportHeightClass,
          PADDING_X_CLASS_MAP[padding],
          disableVerticalPadding ? "py-0" : PADDING_Y_CLASS_MAP[padding],
          VERTICAL_ALIGN_MAP[verticalAlign]
        )}
      >
        <div className="flex-1 w-full min-h-0">
          <div
            className={composeClasses(
              "mx-auto flex h-full min-h-0 w-full flex-col",
              CONTENT_WIDTH_CLASS_MAP[contentWidth],
              GAP_CLASS_MAP[gap],
              ALIGN_CLASS_MAP[align]
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArcadePage;

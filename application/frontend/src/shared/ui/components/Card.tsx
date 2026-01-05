import {
  forwardRef,
  useMemo,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { composeClasses } from "../utils/composeClasses";
import { withAlpha } from "../utils/color";
import { useTheme } from "../theme";

function normalizeHex(hex: string): string | null {
  const trimmed = hex.trim();
  if (/^#([0-9a-fA-F]{3}){1,2}$/.test(trimmed)) {
    if (trimmed.length === 4) {
      const r = trimmed[1];
      const g = trimmed[2];
      const b = trimmed[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return trimmed;
  }

  return null;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHex(hex);
  if (!normalized) {
    return null;
  }

  const value = normalized.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return null;
  }

  return { r, g, b };
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }) {
  const toLinear = (value: number) => {
    const channel = value / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  };

  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function isLightTheme(theme: ReturnType<typeof useTheme>): boolean {
  const rgb = hexToRgb(theme.palette.surface.base);
  if (!rgb) {
    return false;
  }

  return relativeLuminance(rgb) > 0.6;
}

export type CardSurface =
  | "base"
  | "glass"
  | "panel"
  | "gradient"
  | "accent"
  | "inverted"
  | "outline";

export type CardTone =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "success"
  | "danger"
  | "light";

export type CardPadding = "none" | "xs" | "sm" | "md" | "lg" | "xl";

export type CardElevation = "none" | "glow" | "retro" | "panel";

export type CardMotion = "none" | "fade" | "scale" | "slide-up" | "slide-down";

type BaseCardProps = Omit<HTMLAttributes<HTMLDivElement>, "style">;

export interface CardProps extends BaseCardProps {
  children: ReactNode;
  className?: string;
  surface?: CardSurface;
  tone?: CardTone;
  padding?: CardPadding;
  elevation?: CardElevation;
  border?: "none" | "thin" | "regular" | "thick";
  alignment?: "start" | "center";
  overflow?: "visible" | "hidden";
  motion?: CardMotion;
  interactive?: boolean;
  fullWidth?: boolean;
  as?: "div" | "section" | "article";
}

interface CardSurfaceTokens {
  background: string;
  borderColor: string;
  textColor: string;
  secondaryShadow?: string;
}

const PADDING_CLASS_MAP: Record<CardPadding, string> = {
  none: "p-0",
  xs: "p-3",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-10",
};

const MOTION_CLASS_MAP: Record<CardMotion, string> = {
  none: "",
  fade: "animate-fade-in",
  scale: "animate-scale-in",
  "slide-up": "animate-slide-up",
  "slide-down": "animate-slide-down",
};

function resolveToneColor(tone: CardTone, theme: ReturnType<typeof useTheme>) {
  switch (tone) {
    case "secondary":
      return theme.palette.secondary;
    case "accent":
      return theme.palette.accent;
    case "success":
      return theme.palette.success;
    case "danger":
      return theme.palette.danger;
    case "light":
      return theme.palette.neutral;
    case "neutral":
      return theme.palette.neutral;
    case "primary":
    default:
      return theme.palette.primary;
  }
}

function resolveSurfaceTokens(
  surface: CardSurface,
  tone: CardTone,
  theme: ReturnType<typeof useTheme>
): CardSurfaceTokens {
  const tonePalette = resolveToneColor(tone, theme);
  const lightTheme = isLightTheme(theme);

  switch (surface) {
    case "glass":
      return {
        background: withAlpha(theme.palette.surface.overlay, 0.75),
        borderColor: lightTheme
          ? withAlpha(theme.palette.primary[500], 0.22)
          : withAlpha(theme.palette.accent[500], 0.35),
        textColor: theme.palette.text.primary,
      };
    case "panel":
      return {
        background: theme.palette.surface.elevated,
        borderColor: withAlpha(tonePalette[500], 0.35),
        textColor: theme.palette.text.primary,
        secondaryShadow: theme.effects.panel,
      };
    case "gradient":
      return {
        background: `linear-gradient(135deg, ${tonePalette[500]}, ${theme.palette.secondary[400]})`,
        borderColor: withAlpha(tonePalette[200], 0.6),
        textColor: theme.palette.text.primary,
      };
    case "accent":
      return {
        background: withAlpha(tonePalette[500], 0.2),
        borderColor: withAlpha(tonePalette[400], 0.7),
        textColor: theme.palette.text.primary,
      };
    case "inverted":
      return {
        background: theme.palette.surface.inverted,
        borderColor: withAlpha(theme.palette.primary[400], 0.5),
        textColor: theme.palette.text.inverted,
      };
    case "outline":
      return {
        background: withAlpha(theme.palette.surface.base, 0.92),
        borderColor: tonePalette[400],
        textColor: theme.palette.text.primary,
      };
    case "base":
    default:
      return {
        background: withAlpha(theme.palette.surface.base, 0.95),
        borderColor: withAlpha(theme.palette.primary[500], 0.25),
        textColor: theme.palette.text.primary,
      };
  }
}

function resolveElevationShadow(
  elevation: CardElevation,
  theme: ReturnType<typeof useTheme>
): string {
  switch (elevation) {
    case "retro":
      return theme.effects.retro;
    case "panel":
      return theme.effects.panel;
    case "glow":
      return theme.effects.glow;
    case "none":
    default:
      return "none";
  }
}

export const Card = forwardRef<HTMLElement, CardProps>(
  (
    {
      children,
      className,
      surface = "base",
      tone = "primary",
      padding = "lg",
      elevation = "glow",
      border = "regular",
      alignment = "start",
      overflow = "visible",
      motion = "none",
      interactive = false,
      fullWidth = true,
      as = "div",
      onClick,
      ...rest
    },
    ref
  ) => {
    const theme = useTheme();
    const resolvedSurface = useMemo(
      () => resolveSurfaceTokens(surface, tone, theme),
      [surface, tone, theme]
    );
    const resolvedShadow = useMemo(
      () => resolveElevationShadow(elevation, theme),
      [elevation, theme]
    );

    const Component: ElementType = as;
    const borderWidthValue =
      border === "none" ? "0" : theme.borderWidths[border];
    const style = {
      borderWidth: borderWidthValue,
      borderStyle: "solid",
      "--arcade-card-bg": resolvedSurface.background,
      "--arcade-card-border": resolvedSurface.borderColor,
      "--arcade-card-text": resolvedSurface.textColor,
      "--arcade-card-shadow": resolvedShadow,
    } as CSSProperties & Record<string, string>;

    const isInteractive = interactive || Boolean(onClick);

    const baseClasses = composeClasses(
      fullWidth ? "w-full" : undefined,
      "relative",
      "rounded-[var(--arcade-radius-lg)]",
      padding ? PADDING_CLASS_MAP[padding] : undefined,
      overflow === "hidden" ? "overflow-hidden" : undefined,
      alignment === "center" ? "text-center" : "text-left",
      motion !== "none" ? MOTION_CLASS_MAP[motion] : undefined,
      className
    );

    const interactiveAttributes = isInteractive
      ? {
          role: onClick ? "button" : undefined,
          tabIndex: onClick ? 0 : undefined,
          onClick,
          onKeyDown: onClick
            ? (event: KeyboardEvent<HTMLDivElement>) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onClick(event as unknown as MouseEvent<HTMLDivElement>);
                }
              }
            : undefined,
          "data-interactive": true,
        }
      : undefined;

    return (
      <Component
        ref={ref as never}
        data-arcade-card="true"
        data-overflow={overflow}
        style={style}
        className={baseClasses}
        {...interactiveAttributes}
        {...rest}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = "Card";

export default Card;

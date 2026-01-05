import {
  forwardRef,
  useMemo,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from "react";
import { composeClasses } from "../utils/composeClasses";
import { withAlpha } from "../utils/color";
import { useTheme } from "../theme";
import { Icon, type IconTone, type IconSource, renderIconNode } from "../icons";

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

function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return false;
  }

  return relativeLuminance(rgb) > 0.6;
}

function pickReadableTextColor(
  backgroundHex: string,
  theme: ReturnType<typeof useTheme>
): string {
  return isLightColor(backgroundHex)
    ? theme.palette.text.primary
    : theme.palette.text.inverted;
}

function isLightTheme(theme: ReturnType<typeof useTheme>): boolean {
  const rgb = hexToRgb(theme.palette.surface.base);
  if (!rgb) {
    return false;
  }

  return relativeLuminance(rgb) > 0.6;
}

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "danger"
  | "outline"
  | "ghost";

export type ButtonTone =
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "danger"
  | "neutral";

export type ButtonEffect = "glow" | "retro" | "flat";

export type ButtonSize = "sm" | "md" | "lg" | "xl";

export type ButtonAlignment = "start" | "center" | "end";

type ButtonIcon = IconSource;

type IconPosition = "start" | "end";

type BaseButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "style" | "children"
>;

export interface ButtonProps extends BaseButtonProps {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  fullWidth?: boolean;
  effect?: ButtonEffect;
  icon?: ButtonIcon;
  iconPosition?: IconPosition;
  tooltip?: string;
  loading?: boolean;
  alignment?: ButtonAlignment;
}

type ButtonSurface = {
  background: string;
  backgroundHover: string;
  backgroundDisabled: string;
  text: string;
  textHover: string;
  textDisabled: string;
  border: string;
  borderHover: string;
  borderDisabled: string;
};

const SIZE_CLASS_MAP: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-xs gap-2",
  md: "px-4 py-3 text-sm gap-2",
  lg: "px-6 py-4 text-base gap-3",
  xl: "px-8 py-5 text-xl gap-4",
};

const ICON_SIZE_MAP: Record<ButtonSize, number> = {
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
};

function resolveTonePalette(
  tone: ButtonTone,
  theme: ReturnType<typeof useTheme>
) {
  switch (tone) {
    case "secondary":
      return theme.palette.secondary;
    case "accent":
      return theme.palette.accent;
    case "success":
      return theme.palette.success;
    case "danger":
      return theme.palette.danger;
    case "neutral":
      return theme.palette.neutral;
    case "primary":
    default:
      return theme.palette.primary;
  }
}

function resolveButtonSurface(
  variant: ButtonVariant,
  tone: ButtonTone,
  theme: ReturnType<typeof useTheme>
): ButtonSurface {
  const palette = resolveTonePalette(tone, theme);
  const lightTheme = isLightTheme(theme);
  const defaultSurface: ButtonSurface = {
    background: palette[500],
    backgroundHover: palette[400],
    backgroundDisabled: withAlpha(theme.palette.neutral[700], 0.35),
    text: theme.palette.text.primary,
    textHover: theme.palette.text.primary,
    textDisabled: withAlpha(theme.palette.text.primary, 0.55),
    border: palette[300],
    borderHover: palette[200],
    borderDisabled: withAlpha(theme.palette.neutral[600], 0.5),
  };

  if (variant === "outline" || (variant === "ghost" && tone !== "neutral")) {
    defaultSurface.text = lightTheme ? palette[800] : palette[500];
    defaultSurface.textHover = lightTheme
      ? theme.palette.text.primary
      : theme.palette.text.inverted;
  }

  switch (variant) {
    case "primary":
      return defaultSurface;
    case "secondary":
      return {
        ...defaultSurface,
        background: theme.palette.secondary[500],
        backgroundHover: theme.palette.secondary[400],
        border: theme.palette.secondary[300],
        borderHover: theme.palette.secondary[200],
      };
    case "accent":
      return {
        ...defaultSurface,
        background: theme.palette.accent[500],
        backgroundHover: theme.palette.accent[400],
        text: pickReadableTextColor(theme.palette.accent[500], theme),
        textHover: pickReadableTextColor(theme.palette.accent[400], theme),
        border: theme.palette.accent[300],
        borderHover: theme.palette.accent[200],
      };
    case "success":
      return {
        ...defaultSurface,
        background: theme.palette.success[500],
        backgroundHover: theme.palette.success[400],
        text: theme.palette.text.inverted,
        textHover: theme.palette.text.inverted,
        border: theme.palette.success[300],
        borderHover: theme.palette.success[200],
      };
    case "danger":
      return {
        ...defaultSurface,
        background: theme.palette.danger[500],
        backgroundHover: theme.palette.danger[400],
        border: theme.palette.danger[300],
        borderHover: theme.palette.danger[200],
      };
    case "outline": {
      const outlinePalette = resolveTonePalette(tone, theme);
      return {
        background: "transparent",
        backgroundHover: withAlpha(
          outlinePalette[500],
          lightTheme ? 0.12 : 0.18
        ),
        backgroundDisabled: withAlpha(theme.palette.neutral[800], 0.4),
        text: lightTheme ? outlinePalette[800] : outlinePalette[400],
        textHover: lightTheme
          ? theme.palette.text.primary
          : theme.palette.text.inverted,
        textDisabled: withAlpha(theme.palette.text.primary, 0.4),
        border: lightTheme ? outlinePalette[700] : outlinePalette[400],
        borderHover: lightTheme ? outlinePalette[800] : outlinePalette[300],
        borderDisabled: withAlpha(theme.palette.neutral[600], 0.4),
      };
    }
    case "ghost": {
      const ghostPalette = resolveTonePalette(tone, theme);
      const baseBackground =
        tone === "neutral"
          ? withAlpha(theme.palette.surface.overlay, 0.75)
          : withAlpha(ghostPalette[500], 0.12);

      const tintedText = lightTheme ? ghostPalette[800] : ghostPalette[300];
      const tintedTextHover = lightTheme
        ? ghostPalette[900]
        : ghostPalette[200];
      const tintedBorder = lightTheme
        ? withAlpha(ghostPalette[700], 0.45)
        : withAlpha(ghostPalette[500], 0.35);
      const tintedBorderHover = lightTheme
        ? ghostPalette[800]
        : ghostPalette[400];

      return {
        background: baseBackground,
        backgroundHover: withAlpha(ghostPalette[500], lightTheme ? 0.16 : 0.22),
        backgroundDisabled: withAlpha(theme.palette.surface.muted, 0.45),
        text: tone === "neutral" ? theme.palette.text.secondary : tintedText,
        textHover:
          tone === "neutral" ? theme.palette.text.primary : tintedTextHover,
        textDisabled: withAlpha(theme.palette.text.primary, 0.45),
        border:
          tone === "neutral"
            ? withAlpha(theme.palette.neutral[400], 0.4)
            : tintedBorder,
        borderHover:
          tone === "neutral"
            ? withAlpha(theme.palette.neutral[300], 0.5)
            : tintedBorderHover,
        borderDisabled: withAlpha(theme.palette.neutral[600], 0.35),
      };
    }
    default:
      return defaultSurface;
  }
}

function resolveEffectShadows(
  effect: ButtonEffect,
  theme: ReturnType<typeof useTheme>
): { shadow: string; shadowHover: string } {
  switch (effect) {
    case "retro":
      return {
        shadow: theme.effects.retro,
        shadowHover: theme.effects.retroHover,
      };
    case "flat":
      return { shadow: "none", shadowHover: "none" };
    case "glow":
    default:
      return {
        shadow: theme.effects.glow,
        shadowHover: theme.effects.glowHover,
      };
  }
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      tone = "primary",
      size = "md",
      fullWidth = false,
      effect = "glow",
      icon,
      iconPosition = "start",
      tooltip,
      loading = false,
      disabled,
      type = "button",
      alignment = "center",
      ...rest
    },
    ref
  ) => {
    const theme = useTheme();
    const { title: nativeTitle, ...domProps } = rest;
    const surface = useMemo(
      () => resolveButtonSurface(variant, tone, theme),
      [variant, tone, theme]
    );
    const shadows = useMemo(
      () => resolveEffectShadows(effect, theme),
      [effect, theme]
    );

    const isDisabled = disabled || loading;

    const style = {
      borderWidth: theme.borderWidths.regular,
      borderStyle: "solid",
    } as CSSProperties & Record<string, string>;

    style["--arcade-btn-bg"] = surface.background;
    style["--arcade-btn-bg-hover"] = surface.backgroundHover;
    style["--arcade-btn-bg-disabled"] = surface.backgroundDisabled;
    style["--arcade-btn-text"] = surface.text;
    style["--arcade-btn-text-hover"] = surface.textHover;
    style["--arcade-btn-text-disabled"] = surface.textDisabled;
    style["--arcade-btn-border"] = surface.border;
    style["--arcade-btn-border-hover"] = surface.borderHover;
    style["--arcade-btn-border-disabled"] = surface.borderDisabled;
    style["--arcade-btn-shadow"] = shadows.shadow;
    style["--arcade-btn-shadow-hover"] = shadows.shadowHover;

    const alignmentClass =
      alignment === "start"
        ? "justify-start"
        : alignment === "end"
        ? "justify-end"
        : "justify-center";

    const baseClasses = composeClasses(
      "relative inline-flex items-center font-display uppercase",
      "tracking-[var(--arcade-letter-spacing-normal)]",
      "transition-all duration-200",
      "rounded-[var(--arcade-radius-lg)]",
      "focus-visible:outline-none",
      "focus-visible:[box-shadow:var(--arcade-effect-focus-ring)]",
      alignmentClass,
      SIZE_CLASS_MAP[size],
      fullWidth ? "w-full" : undefined,
      isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
      loading ? "pointer-events-none" : undefined,
      className
    );

    const resolvedIcon = renderIconNode(icon, {
      fallbackTone: tone as IconTone,
      size: ICON_SIZE_MAP[size],
      strokeWidth: 2,
      primitiveClassName: "inline-flex items-center justify-center",
    });
    const spinner = (
      <span className="inline-flex animate-spin" aria-hidden>
        <Icon
          name="LoaderCircle"
          tone={tone as IconTone}
          size={ICON_SIZE_MAP[size]}
          strokeWidth={2}
        />
      </span>
    );

    const iconBefore = loading
      ? spinner
      : iconPosition === "start"
      ? resolvedIcon
      : null;

    const iconAfter = !loading && iconPosition === "end" ? resolvedIcon : null;

    const contentAlignmentClass =
      alignment === "start"
        ? "justify-start"
        : alignment === "end"
        ? "justify-end"
        : "justify-center";

    const content = (
      <span
        className={composeClasses(
          "inline-flex items-center gap-2",
          fullWidth ? "w-full" : undefined,
          alignment === "center" ? "justify-center" : contentAlignmentClass
        )}
      >
        {iconBefore}
        <span
          className={composeClasses(
            "inline-flex items-center whitespace-nowrap",
            contentAlignmentClass
          )}
        >
          {children}
        </span>
        {iconAfter}
      </span>
    );

    const title = tooltip ?? nativeTitle;

    return (
      <button
        ref={ref}
        type={type}
        data-arcade-button="true"
        data-effect={effect}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        disabled={isDisabled}
        title={title}
        style={style}
        className={baseClasses}
        {...domProps}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;

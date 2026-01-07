import {
  createElement,
  forwardRef,
  useMemo,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from "react";
import { composeClasses } from "../../../utils/composeClasses";
import { withAlpha } from "../../../utils/color";
import { useTheme } from "../../theme";
import { type IconTone, type IconSource, renderIconNode } from "../../icons";

export type ButtonVariant = "primary" | "secondary" | "danger";

export type ButtonEffect = "retro" | "flat";

export type ButtonSize = "sm" | "md" | "lg" | "xl";

export type ButtonAlignment = "start" | "center" | "end";

type ButtonIcon = IconSource;

type BaseButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
>;

export interface ButtonProps extends BaseButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  effect?: ButtonEffect;
  icon?: ButtonIcon;
  tooltip?: string;
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

function resolveButtonSurface(
  variant: ButtonVariant,
  theme: ReturnType<typeof useTheme>
): ButtonSurface {
  const isLightTheme =
    theme.palette.surface.base.toLowerCase() === "#f5f5ff" ||
    theme.palette.text.primary.toLowerCase() === "#0a0a1f";

  const defaultSurface: ButtonSurface = {
    background: theme.palette.primary[500],
    backgroundHover: theme.palette.primary[400],
    backgroundDisabled: withAlpha(theme.palette.neutral[700], 0.35),
    text: theme.palette.text.primary,
    textHover: theme.palette.text.primary,
    textDisabled: withAlpha(theme.palette.text.primary, 0.55),
    border: theme.palette.primary[300],
    borderHover: theme.palette.primary[200],
    borderDisabled: withAlpha(theme.palette.neutral[600], 0.5),
  };

  switch (variant) {
    case "primary":
      return isLightTheme
        ? {
            ...defaultSurface,
            text: theme.palette.text.inverted,
            textHover: theme.palette.text.inverted,
            textDisabled: withAlpha(theme.palette.text.inverted, 0.55),
          }
        : defaultSurface;
    case "secondary":
      return {
        ...defaultSurface,
        background: "transparent",
        backgroundHover: "transparent",
        backgroundDisabled: "transparent",
        border: theme.palette.secondary[300],
        borderHover: theme.palette.secondary[200],
      };
    case "danger":
      return {
        ...defaultSurface,
        background: theme.palette.danger[500],
        backgroundHover: theme.palette.danger[400],
        border: theme.palette.danger[300],
        borderHover: theme.palette.danger[200],
      };
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
    default:
      return { shadow: "none", shadowHover: theme.effects.glow };
  }
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      effect = "flat",
      icon,
      tooltip,
      disabled,
      type = "button",
      alignment = "center",
      ...rest
    },
    ref
  ) => {
    const theme = useTheme();
    const {
      title: nativeTitle,
      className,
      style: styleFromProps,
      ...domProps
    } = rest;
    const surface = useMemo(
      () => resolveButtonSurface(variant, theme),
      [variant, theme]
    );
    const shadows = useMemo(
      () => resolveEffectShadows(effect, theme),
      [effect, theme]
    );

    const isDisabled = disabled;

    const variantClassName =
      variant === "secondary"
        ? "!bg-transparent enabled:hover:!bg-transparent disabled:!bg-transparent"
        : undefined;

    const effectClassName =
      effect === "retro"
        ? "enabled:hover:translate-x-[2px] enabled:hover:translate-y-[2px]"
        : undefined;

    const flatEffectClassName =
      effect === "flat" ? "enabled:active:translate-y-[1px]" : undefined;

    const radiusClassName =
      effect === "flat"
        ? "rounded-[var(--arcade-radius-sm)]"
        : "rounded-[var(--arcade-radius-lg)]";

    const transitionClassName =
      effect === "flat"
        ? "transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out"
        : "transition-all duration-200";

    const disabledShadowClassName =
      effect === "retro" ? undefined : "disabled:shadow-none";

    const style = {
      ...(styleFromProps ?? {}),
      borderWidth:
        effect === "flat"
          ? theme.borderWidths.thin
          : theme.borderWidths.regular,
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
      transitionClassName,
      radiusClassName,
      "focus-visible:outline-none",
      "focus-visible:[box-shadow:var(--arcade-effect-focus-ring)]",
      "border-[color:var(--arcade-btn-border)]",
      "bg-[var(--arcade-btn-bg)]",
      "text-[color:var(--arcade-btn-text)]",
      "shadow-[var(--arcade-btn-shadow)]",
      "enabled:hover:bg-[var(--arcade-btn-bg-hover)]",
      "enabled:hover:text-[color:var(--arcade-btn-text-hover)]",
      "enabled:hover:border-[color:var(--arcade-btn-border-hover)]",
      "enabled:hover:shadow-[var(--arcade-btn-shadow-hover)]",
      "disabled:bg-[var(--arcade-btn-bg-disabled)]",
      "disabled:text-[color:var(--arcade-btn-text-disabled)]",
      "disabled:border-[color:var(--arcade-btn-border-disabled)]",
      disabledShadowClassName,
      "disabled:opacity-60",
      "disabled:transition-none",
      "disabled:cursor-not-allowed",
      "cursor-pointer",
      variantClassName,
      effectClassName,
      flatEffectClassName,
      alignmentClass,
      SIZE_CLASS_MAP[size],
      fullWidth ? "w-full" : undefined
    );

    const fallbackTone: IconTone = variant;

    const resolvedIcon = renderIconNode(icon, {
      fallbackTone,
      size: ICON_SIZE_MAP[size],
      strokeWidth: 2,
      primitiveClassName: "inline-flex items-center justify-center",
    });
    const iconBefore = resolvedIcon ?? null;

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
      </span>
    );

    const title = tooltip ?? nativeTitle;

    return createElement(
      "button",
      {
        ref,
        type,
        "data-arcade-button": "true",
        "data-variant": variant,
        "data-effect": effect,
        "aria-disabled": isDisabled || undefined,
        disabled: isDisabled,
        title,
        style,
        className: composeClasses(baseClasses, className),
        ...domProps,
      },
      content
    );
  }
);

Button.displayName = "Button";

export default Button;

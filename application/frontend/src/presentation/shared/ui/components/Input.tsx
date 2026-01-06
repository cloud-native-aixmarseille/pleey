import {
  forwardRef,
  useId,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { composeClasses } from "../../utils/composeClasses";
import { withAlpha } from "../../utils/color";
import { useTheme } from "../theme";
import { type IconSource, renderIconNode } from "../icons";

export type InputTone = "default" | "dark";

type InputIcon = IconSource;

type BaseInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "style" | "className"
>;

export interface InputProps extends BaseInputProps {
  label?: string;
  hint?: string;
  error?: string;
  tone?: InputTone;
  fullWidth?: boolean;
  icon?: InputIcon;
  trailingNode?: ReactNode;
}

type InputSurface = {
  background: string;
  backgroundFocus: string;
  border: string;
  borderFocus: string;
  text: string;
  placeholder: string;
};

function resolveSurface(
  tone: InputTone,
  theme: ReturnType<typeof useTheme>
): InputSurface {
  if (tone === "dark") {
    return {
      background: withAlpha(theme.palette.surface.overlay, 0.85),
      backgroundFocus: withAlpha(theme.palette.surface.overlay, 0.95),
      border: withAlpha(theme.palette.accent[500], 0.35),
      borderFocus: theme.palette.accent[400],
      text: theme.palette.text.primary,
      placeholder: withAlpha(theme.palette.text.primary, 0.55),
    };
  }

  return {
    background: withAlpha(theme.palette.surface.base, 0.9),
    backgroundFocus: withAlpha(theme.palette.surface.elevated, 0.95),
    border: withAlpha(theme.palette.primary[500], 0.35),
    borderFocus: theme.palette.primary[400],
    text: theme.palette.text.primary,
    placeholder: withAlpha(theme.palette.text.primary, 0.45),
  };
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      tone = "default",
      fullWidth = true,
      icon,
      id: providedId,
      disabled,
      trailingNode,
      ...rest
    },
    ref
  ) => {
    const theme = useTheme();
    const generatedId = useId();
    const inputId = providedId ?? generatedId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const surface = resolveSurface(tone, theme);

    const style = {
      "--arcade-input-bg": surface.background,
      "--arcade-input-bg-focus": surface.backgroundFocus,
      "--arcade-input-border": surface.border,
      "--arcade-input-border-focus": surface.borderFocus,
      "--arcade-input-text": surface.text,
      "--arcade-input-placeholder": surface.placeholder,
    } as CSSProperties & Record<string, string>;

    const hasError = Boolean(error);
    const hasTrailingNode = Boolean(trailingNode);
    const iconNode = renderIconNode(icon, {
      fallbackTone: tone === "dark" ? "accent" : "primary",
      size: 18,
      strokeWidth: 2,
      primitiveClassName: "text-lg",
    });

    if (hasError) {
      style["--arcade-input-border"] = theme.palette.danger[400];
      style["--arcade-input-border-focus"] = theme.palette.danger[300];
      style["--arcade-input-text"] = theme.palette.text.primary;
      style["--arcade-input-placeholder"] = withAlpha(
        theme.palette.danger[100],
        0.8
      );
    }

    return (
      <div className={fullWidth ? "w-full" : undefined}>
        {label ? (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-[0.2em] text-dark-400 dark:text-light-500"
          >
            {label}
          </label>
        ) : null}
        <div
          className="relative flex items-center"
          data-arcade-input-container="true"
        >
          {iconNode ? (
            <span
              className="absolute left-4 flex items-center justify-center"
              aria-hidden
            >
              {iconNode}
            </span>
          ) : null}
          {trailingNode ? (
            <span className="absolute right-3 flex items-center">
              {trailingNode}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={composeClasses(
              "w-full rounded-[var(--arcade-radius-lg)] border bg-[var(--arcade-input-bg)]",
              "border-[var(--arcade-input-border)] px-5 py-4 font-mono text-sm",
              iconNode ? "pl-12" : undefined,
              hasTrailingNode ? "pr-16" : undefined,
              fullWidth ? "max-w-full" : undefined
            )}
            style={style}
            data-arcade-input="true"
            {...rest}
          />
        </div>
        {hint && !error ? (
          <p
            id={hintId}
            className="mt-2 text-xs text-dark-400 dark:text-light-500"
          >
            {hint}
          </p>
        ) : null}
        {error ? (
          <p
            id={errorId}
            className="mt-2 text-xs font-semibold text-danger-400"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

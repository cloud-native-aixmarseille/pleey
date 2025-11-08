import { forwardRef } from "react";
import Button, { type ButtonProps, type ButtonVariant } from "./Button";

type BackToButtonVariant = "secondary" | "ghost" | "link";
type BackToButtonTone = "default" | "light" | "accent" | "primary";
type BackToButtonAlignment = "start" | "center";

interface BackToButtonProps
  extends Omit<
    ButtonProps,
    "children" | "variant" | "icon" | "className" | "size"
  > {
  label: string;
  variant?: BackToButtonVariant;
  tone?: BackToButtonTone;
  alignment?: BackToButtonAlignment;
}

const baseClasses = "inline-flex items-center gap-2";

const variantButtonMap: Record<BackToButtonVariant, ButtonVariant> = {
  secondary: "secondary",
  ghost: "ghost",
  link: "ghost",
};

const variantBaseClass: Record<BackToButtonVariant, string> = {
  secondary:
    "retro-shadow font-display text-sm sm:text-base hover:scale-105 transition-all",
  ghost: "!bg-transparent !border-0 !shadow-none transition-colors",
  link: "!bg-transparent !border-0 !shadow-none font-mono text-sm transition-colors underline-offset-4",
};

const toneClassMap: Record<
  BackToButtonVariant,
  Record<BackToButtonTone, string>
> = {
  secondary: {
    default: "",
    light: "",
    accent: "",
    primary: "",
  },
  ghost: {
    default: "text-light-700 hover:text-primary-600",
    light: "text-white hover:text-primary-400",
    accent: "text-accent-400 hover:text-accent-300",
    primary: "text-primary-400 hover:text-primary-300",
  },
  link: {
    default: "text-accent-400 hover:text-accent-300",
    light: "text-white hover:text-accent-200",
    accent: "text-accent-400 hover:text-accent-300",
    primary: "text-primary-400 hover:text-primary-300 underline",
  },
};

const alignmentClassMap: Record<BackToButtonAlignment, string> = {
  start: "",
  center: "justify-center",
};

const BackToButton = forwardRef<HTMLButtonElement, BackToButtonProps>(
  (
    {
      label,
      fullWidth,
      variant = "secondary",
      tone = "default",
      alignment = "start",
      ...rawProps
    },
    ref
  ) => {
    const { ["aria-label"]: ariaLabelFromProps, ...buttonProps } = rawProps;
    const iconClass = "text-base";
    const buttonVariant = variantButtonMap[variant] ?? "secondary";
    const baseClass = variantBaseClass[variant] ?? variantBaseClass.secondary;
    const toneClasses =
      toneClassMap[variant]?.[tone] ?? toneClassMap[variant]?.default ?? "";
    const alignmentClass =
      alignmentClassMap[alignment] ?? alignmentClassMap.start;
    const computedClass =
      `${baseClasses} ${baseClass} ${toneClasses} ${alignmentClass}`.trim();

    return (
      <Button
        ref={ref}
        variant={buttonVariant}
        size="sm"
        fullWidth={fullWidth}
        className={computedClass}
        icon={
          <span aria-hidden="true" className={iconClass}>
            ←
          </span>
        }
        aria-label={ariaLabelFromProps ?? label}
        {...buttonProps}
      >
        {label}
      </Button>
    );
  }
);

BackToButton.displayName = "BackToButton";

export default BackToButton;

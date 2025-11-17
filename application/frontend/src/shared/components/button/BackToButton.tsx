import { forwardRef } from "react";
import Button, {
  type ButtonAlignment,
  type ButtonEffect,
  type ButtonProps,
  type ButtonTone,
  type ButtonVariant,
} from "./Button";
import { composeClasses } from "../../ui/utils/composeClasses";

type BackToButtonVariant = "secondary" | "ghost" | "link";
type BackToButtonTone = "default" | "light" | "accent" | "primary";
type BackToButtonAlignment = ButtonAlignment;

interface BackToButtonProps
  extends Omit<ButtonProps, "children" | "variant" | "icon" | "size" | "tone"> {
  label: string;
  variant?: BackToButtonVariant;
  tone?: BackToButtonTone;
  alignment?: BackToButtonAlignment;
}

interface ButtonConfig {
  variant: ButtonVariant;
  tone?: ButtonTone;
  effect: ButtonEffect;
  iconTone: ButtonTone | "neutral";
  labelClass?: string;
}

const toneMapping: Record<BackToButtonTone, ButtonTone> = {
  default: "neutral",
  light: "primary",
  accent: "accent",
  primary: "primary",
};

function resolveConfig(
  variant: BackToButtonVariant,
  tone: BackToButtonTone
): ButtonConfig {
  switch (variant) {
    case "ghost":
      return {
        variant: "ghost",
        tone: toneMapping[tone],
        effect: "flat",
        iconTone: toneMapping[tone],
      };
    case "link":
      return {
        variant: "ghost",
        tone: toneMapping[tone],
        effect: "flat",
        iconTone: toneMapping[tone],
        labelClass: "font-mono text-sm underline underline-offset-4",
      };
    case "secondary":
    default:
      return {
        variant: "secondary",
        effect: "retro",
        iconTone: "neutral",
      };
  }
}

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
    const config = resolveConfig(variant, tone);
    const labelContent = config.labelClass ? (
      <span className={config.labelClass}>{label}</span>
    ) : (
      label
    );

    return (
      <Button
        ref={ref}
        variant={config.variant}
        tone={config.tone}
        effect={config.effect}
        size="sm"
        fullWidth={fullWidth}
        alignment={alignment}
        icon={{ name: "ArrowLeft", tone: config.iconTone }}
        aria-label={ariaLabelFromProps ?? label}
        {...buttonProps}
      >
        <span
          className={composeClasses(
            "inline-flex items-center gap-2",
            alignment === "center" ? "justify-center" : ""
          )}
        >
          {labelContent}
        </span>
      </Button>
    );
  }
);

BackToButton.displayName = "BackToButton";

export default BackToButton;

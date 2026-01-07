import { forwardRef } from "react";
import { Button, type ButtonAlignment, type ButtonProps } from "./Button";
import { composeClasses } from "../../../utils/composeClasses";

type BackToButtonAlignment = ButtonAlignment;

export interface BackToButtonProps
  extends Omit<
    ButtonProps,
    "children" | "variant" | "icon" | "size" | "effect"
  > {
  label: string;
  alignment?: BackToButtonAlignment;
}

export const BackToButton = forwardRef<HTMLButtonElement, BackToButtonProps>(
  ({ label, fullWidth, alignment = "start", ...rawProps }, ref) => {
    const { ["aria-label"]: ariaLabelFromProps, ...buttonProps } = rawProps;

    return (
      <Button
        ref={ref}
        variant="secondary"
        effect="retro"
        size="sm"
        fullWidth={fullWidth}
        alignment={alignment}
        icon={{ name: "ArrowLeft", tone: "neutral" }}
        aria-label={ariaLabelFromProps ?? label}
        {...buttonProps}
      >
        <span
          className={composeClasses(
            "inline-flex items-center gap-2",
            alignment === "center" ? "justify-center" : undefined
          )}
        >
          {label}
        </span>
      </Button>
    );
  }
);

BackToButton.displayName = "BackToButton";

export default BackToButton;

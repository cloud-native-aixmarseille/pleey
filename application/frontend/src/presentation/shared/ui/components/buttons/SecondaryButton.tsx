import { forwardRef } from "react";
import { Button, type ButtonProps } from "./Button";

export type SecondaryButtonProps = Omit<ButtonProps, "variant" | "className">;

export const SecondaryButton = forwardRef<
  HTMLButtonElement,
  SecondaryButtonProps
>((props, ref) => <Button ref={ref} variant="secondary" {...props} />);

SecondaryButton.displayName = "SecondaryButton";

export default SecondaryButton;

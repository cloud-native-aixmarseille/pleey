import { forwardRef } from "react";
import Button, { type ButtonProps } from "./Button";

export type PrimaryButtonProps = Omit<ButtonProps, "variant">;

const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  (props, ref) => <Button ref={ref} variant="primary" {...props} />
);

PrimaryButton.displayName = "PrimaryButton";

export default PrimaryButton;

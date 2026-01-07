import { forwardRef } from "react";

import { Button, type ButtonProps } from "./Button";

export type DangerButtonProps = Omit<ButtonProps, "variant">;

export const DangerButton = forwardRef<HTMLButtonElement, DangerButtonProps>(
  (props, ref) => <Button ref={ref} variant="danger" {...props} />
);

DangerButton.displayName = "DangerButton";

export default DangerButton;

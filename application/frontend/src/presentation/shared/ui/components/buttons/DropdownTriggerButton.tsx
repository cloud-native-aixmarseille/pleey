import { forwardRef } from "react";

import { SecondaryButton } from "./SecondaryButton";
import type { SecondaryButtonProps } from "./SecondaryButton";
import { Icon } from "../../icons";

export interface DropdownTriggerButtonProps
  extends Omit<SecondaryButtonProps, "children"> {
  label: string;
  value?: string;
  expanded?: boolean;
}

export const DropdownTriggerButton = forwardRef<
  HTMLButtonElement,
  DropdownTriggerButtonProps
>(({ label, value, expanded = false, ...props }, ref) => {
  return (
    <SecondaryButton
      ref={ref}
      type="button"
      effect="flat"
      size="md"
      fullWidth
      alignment="start"
      aria-haspopup="menu"
      aria-expanded={expanded}
      {...props}
    >
      <span className="flex w-full min-w-0 items-center justify-between gap-3">
        <span className="min-w-0 flex-1 text-left">
          <span className="block text-xs text-dark-500 dark:text-light-700">
            {label}
          </span>
          {value ? (
            <span className="block truncate font-bold text-primary-800 dark:text-primary-300">
              {value}
            </span>
          ) : null}
        </span>
        <span
          className={`shrink-0 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          <Icon name="ChevronDown" tone="neutral" size={18} />
        </span>
      </span>
    </SecondaryButton>
  );
});

DropdownTriggerButton.displayName = "DropdownTriggerButton";

export default DropdownTriggerButton;

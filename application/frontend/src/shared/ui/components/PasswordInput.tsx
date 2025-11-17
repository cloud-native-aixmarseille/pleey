import { forwardRef, useState, type ReactNode } from "react";
import { Input, type InputProps } from "./Input";
import type { IconSource } from "../icons";

const PASSWORD_TOGGLE_BUTTON_CLASSES =
  "inline-flex items-center justify-center rounded-xl border border-primary-500/40 bg-dark-500/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-200 transition hover:bg-primary-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-0";

export interface PasswordToggleLabels {
  show: string;
  hide: string;
  showAria: string;
  hideAria: string;
}

export interface PasswordInputProps
  extends Omit<InputProps, "type" | "trailingNode"> {
  toggleLabels: PasswordToggleLabels;
  trailingAdornment?: ReactNode;
}

const DEFAULT_ICON: IconSource = { name: "Lock" };

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ toggleLabels, icon, trailingAdornment, ...rest }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const { show, hide, showAria, hideAria } = toggleLabels;

    const resolvedIcon = icon === undefined ? DEFAULT_ICON : icon;

    const handleToggle = () => {
      setIsVisible((previous) => !previous);
    };

    return (
      <Input
        ref={ref}
        type={isVisible ? "text" : "password"}
        icon={resolvedIcon}
        trailingNode={
          <div className="flex items-center gap-2">
            {trailingAdornment ?? null}
            <button
              type="button"
              onClick={handleToggle}
              className={PASSWORD_TOGGLE_BUTTON_CLASSES}
              aria-label={isVisible ? hideAria : showAria}
              aria-pressed={isVisible}
            >
              {isVisible ? hide : show}
            </button>
          </div>
        }
        {...rest}
      />
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;

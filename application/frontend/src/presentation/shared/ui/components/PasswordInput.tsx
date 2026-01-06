import { forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input, type InputProps } from "./Input";
import type { IconSource } from "../icons";

const PASSWORD_TOGGLE_BUTTON_CLASSES =
  "inline-flex items-center justify-center rounded-lg border border-primary-500/35 bg-light-50/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-900 transition hover:bg-primary-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-0 dark:border-primary-500/40 dark:bg-dark-500/60 dark:text-primary-200 dark:hover:bg-primary-500/20";

export type PasswordInputProps = Omit<
  InputProps,
  "type" | "trailingNode" | "icon"
>;

const DEFAULT_ICON: IconSource = { name: "Lock" };

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ ...rest }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const { t } = useTranslation();

    const show = t("auth.passwordToggle.show");
    const hide = t("auth.passwordToggle.hide");
    const showAria = t("auth.passwordToggle.showAria");
    const hideAria = t("auth.passwordToggle.hideAria");

    const handleToggle = () => {
      setIsVisible((previous) => !previous);
    };

    return (
      <Input
        ref={ref}
        type={isVisible ? "text" : "password"}
        icon={DEFAULT_ICON}
        trailingNode={
          <div className="flex items-center gap-2">
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

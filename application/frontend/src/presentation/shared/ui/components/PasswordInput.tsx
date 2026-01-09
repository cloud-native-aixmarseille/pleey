import { forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SecondaryButton } from "./buttons/SecondaryButton";
import { Input, type InputProps } from "./Input";
import type { IconSource } from "../icons";

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
            <SecondaryButton
              type="button"
              onClick={handleToggle}
              effect="flat"
              size="sm"
              aria-label={isVisible ? hideAria : showAria}
              aria-pressed={isVisible}
            >
              {isVisible ? hide : show}
            </SecondaryButton>
          </div>
        }
        {...rest}
      />
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { PrimaryButton, SecondaryButton } from "../../../shared/ui/components";
import Card from "../../../../presentation/shared/ui/components/Card";
import { composeClasses } from "../../../shared/utils/composeClasses";
import {
  useColorScheme,
  type ColorSchemePreference,
} from "../../../../presentation/shared/ui/theme";
import { Icon } from "../../../../presentation/shared/ui/icons";

interface ThemeSwitcherProps {
  variant?: "fixed" | "inline";
  className?: string;
}

export default function ThemeSwitcher({
  variant = "inline",
  className,
}: ThemeSwitcherProps) {
  const { t } = useTranslation();
  const { preference, setPreference } = useColorScheme();

  const options = useMemo(
    () => [
      {
        value: "system" as const,
        label: t("common.theme.system"),
        tone: "neutral" as const,
        icon: (
          <Icon name="Monitor" size={16} strokeWidth={1.8} tone="neutral" />
        ),
      },
      {
        value: "light" as const,
        label: t("common.theme.light"),
        tone: "accent" as const,
        icon: <Icon name="Sun" size={16} strokeWidth={1.8} tone="accent" />,
      },
      {
        value: "dark" as const,
        label: t("common.theme.dark"),
        tone: "secondary" as const,
        icon: <Icon name="Moon" size={16} strokeWidth={1.8} tone="secondary" />,
      },
    ],
    [t]
  );

  const wrapperClass = composeClasses(
    variant === "fixed" ? "fixed top-4 left-4 z-50" : undefined,
    className
  );

  return (
    <div className={wrapperClass} data-theme-switcher="true">
      <Card
        surface="glass"
        variant="accent"
        padding={variant === "inline" ? "xs" : "sm"}
        elevation="panel"
        fullWidth={false}
      >
        <div
          className="flex items-center gap-2"
          aria-label={t("common.theme.ariaLabel")}
        >
          {options.map((option) => {
            const isActive = preference === option.value;
            const ThemeOptionButton = isActive
              ? PrimaryButton
              : SecondaryButton;

            return (
              <ThemeOptionButton
                key={option.value}
                type="button"
                size="sm"
                effect={isActive ? "retro" : "flat"}
                tooltip={option.label}
                aria-label={option.label}
                aria-pressed={isActive}
                onClick={() =>
                  setPreference(option.value as ColorSchemePreference)
                }
                icon={option.icon}
              >
                <span className="sr-only">{option.label}</span>
              </ThemeOptionButton>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

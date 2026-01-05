import { useTranslation } from "react-i18next";
import Button from "./button/Button";
import Card from "./Card";
import { composeClasses } from "../ui/utils/composeClasses";

interface LanguageSwitcherProps {
  variant?: "fixed" | "inline";
  className?: string;
}

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
];

export default function LanguageSwitcher({
  variant = "fixed",
  className,
}: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("quizmaster_language", lng);
  };

  const wrapperClass = composeClasses(
    variant === "fixed" ? "fixed top-4 right-4 z-50" : undefined,
    className
  );

  return (
    <div className={wrapperClass}>
      <Card
        surface="glass"
        tone="accent"
        padding={variant === "inline" ? "xs" : "sm"}
        elevation="panel"
        fullWidth={false}
      >
        <div className="flex items-center gap-2">
          {LANGUAGES.map(({ code, label }) => {
            const isActive = i18n.language === code;
            const ariaLabel =
              code === "en"
                ? t("common.language.switchToEnglish")
                : t("common.language.switchToFrench");

            return (
              <Button
                key={code}
                variant={isActive ? "accent" : "ghost"}
                tone="accent"
                size="sm"
                effect={isActive ? "retro" : "flat"}
                onClick={() => changeLanguage(code)}
                aria-label={ariaLabel}
              >
                {label}
              </Button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

import { useTranslation } from "react-i18next";

interface LanguageSwitcherProps {
  variant?: "fixed" | "inline";
  className?: string;
}

export default function LanguageSwitcher({
  variant = "fixed",
  className = "",
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("quizmaster_language", lng);
  };

  return (
    <div
      className={`${
        variant === "fixed" ? "fixed top-4 right-4 z-50" : ""
      } ${className}`.trim()}
    >
      <div
        className={`flex items-center gap-1.5 rounded-xl border border-primary-500/25 transition-colors ${
          variant === "inline"
            ? "bg-dark-500/60 backdrop-blur-sm px-2 py-1"
            : "bg-dark-500/80 backdrop-blur-sm px-3 py-2"
        }`}
      >
        <button
          onClick={() => changeLanguage("en")}
          className={`px-2.5 py-1 rounded-lg font-display text-[0.7rem] uppercase tracking-[0.25em] transition-all ${
            i18n.language === "en"
              ? "bg-primary-500 text-white retro-shadow"
              : "text-light-400 hover:text-primary-400 hover:bg-primary-500/10"
          }`}
          aria-label="Switch to English"
        >
          EN
        </button>
        <button
          onClick={() => changeLanguage("fr")}
          className={`px-2.5 py-1 rounded-lg font-display text-[0.7rem] uppercase tracking-[0.25em] transition-all ${
            i18n.language === "fr"
              ? "bg-primary-500 text-white retro-shadow"
              : "text-light-400 hover:text-primary-400 hover:bg-primary-500/10"
          }`}
          aria-label="Passer au français"
        >
          FR
        </button>
      </div>
    </div>
  );
}

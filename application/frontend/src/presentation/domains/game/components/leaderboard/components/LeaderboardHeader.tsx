import { useTranslation } from "react-i18next";

const HEADER_WRAPPER_CLASSES = "mb-12 text-center animate-scale-in";
const HEADER_TITLE_WRAPPER_CLASSES = "relative inline-block";
const HEADER_TITLE_CLASSES =
  "mb-4 inline-block bg-gradient-to-r from-accent-500 via-primary-500 to-secondary-500 bg-clip-text font-display text-6xl uppercase tracking-wider text-transparent animate-glow sm:text-7xl md:text-8xl";
const HEADER_TITLE_GLOW_CLASSES =
  "absolute -inset-4 -z-10 bg-gradient-to-r from-accent-500/20 via-primary-500/20 to-secondary-500/20 blur-2xl animate-pulse-slow";
const HEADER_TROPHY_CLASSES = "mb-4 text-7xl animate-bounce-slow sm:text-8xl";
const HEADER_SUBTITLE_CLASSES =
  "mb-2 font-display text-3xl uppercase text-accent-500 animate-glow sm:text-4xl";
const HEADER_DESCRIPTION_CLASSES =
  "font-body text-lg text-light-300 sm:text-xl";

interface LeaderboardHeaderProps {
  isVisible: boolean;
}

export function LeaderboardHeader({ isVisible }: LeaderboardHeaderProps) {
  const { t } = useTranslation();

  if (!isVisible) {
    return null;
  }

  return (
    <header className={HEADER_WRAPPER_CLASSES}>
      <div className={HEADER_TITLE_WRAPPER_CLASSES}>
        <h1 className={HEADER_TITLE_CLASSES}>
          {t("game.leaderboardPage.title.main")}
        </h1>
        <div className={HEADER_TITLE_GLOW_CLASSES} />
      </div>
      <div className={HEADER_TROPHY_CLASSES}>🏆</div>
      <h2 className={HEADER_SUBTITLE_CLASSES}>
        {t("game.leaderboardPage.title.subtitle")}
      </h2>
      <p className={HEADER_DESCRIPTION_CLASSES}>
        {t("game.leaderboardPage.title.message")}
      </p>
    </header>
  );
}

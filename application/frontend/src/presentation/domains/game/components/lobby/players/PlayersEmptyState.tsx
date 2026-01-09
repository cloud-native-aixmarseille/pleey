import { useTranslation } from "react-i18next";

export default function PlayersEmptyState() {
  const { t } = useTranslation();

  return (
    <div
      className="flex flex-col items-center gap-4 py-12 text-center"
      role="status"
      aria-live="polite"
    >
      <span
        aria-hidden="true"
        className="text-6xl opacity-30 animate-pulse-slow sm:text-7xl"
      >
        👥
      </span>
      <p className="font-display text-lg uppercase tracking-[0.3em] text-primary-900 dark:text-primary-200 sm:text-xl">
        {t("game.noPlayersYetTitle")}
      </p>
      <p className="text-sm text-dark-500 dark:text-light-500 sm:text-base">
        {t("game.sharePin")}
      </p>
    </div>
  );
}

import { useTranslation } from "react-i18next";

export default function AdminHostBadge() {
  const { t } = useTranslation();

  return (
    <div className="mb-6 flex justify-center">
      <div className="glass-effect rounded-2xl px-6 py-3 border-2 border-accent-500 inline-flex items-center gap-3 animate-glow">
        <span className="text-3xl animate-bounce-slow" aria-hidden="true">
          👑
        </span>
        <div className="text-center">
          <span className="font-display text-accent-400 uppercase text-base sm:text-lg tracking-wider block">
            {t("game.hostMode")}
          </span>
          <span className="font-mono text-accent-500 text-xs uppercase tracking-wider">
            {t("game.screenShareHint")}
          </span>
        </div>
      </div>
    </div>
  );
}

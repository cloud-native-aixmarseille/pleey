import { useTranslation } from "react-i18next";

export default function AdminHostBadge() {
  const { t } = useTranslation();

  return (
    <div className="mb-6 flex justify-center" data-admin-host-badge="true">
      <div className="inline-flex items-center gap-3 rounded-2xl border border-accent-400/70 bg-accent-500/10 px-6 py-3 shadow-[0_0_22px_rgba(255,51,198,0.45)] animate-glow">
        <span className="text-3xl animate-bounce-slow" aria-hidden="true">
          👑
        </span>
        <div className="text-center">
          <span className="block font-display text-base uppercase tracking-[0.35em] text-accent-200 sm:text-lg">
            {t("game.hostMode")}
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent-100">
            {t("game.screenShareHint")}
          </span>
        </div>
      </div>
    </div>
  );
}

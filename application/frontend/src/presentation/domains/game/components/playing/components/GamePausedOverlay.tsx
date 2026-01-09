import { useTranslation } from "react-i18next";

const OVERLAY_CLASSES =
  "fixed inset-0 z-50 flex items-center justify-center bg-dark-500/90 backdrop-blur-sm";
const CONTENT_CLASSES =
  "glass-effect flex flex-col items-center gap-6 rounded-2xl border-2 border-accent-500 px-12 py-10 text-center animate-scale-in";
const ICON_CLASSES = "text-6xl animate-pulse";
const TITLE_CLASSES =
  "font-display text-2xl uppercase tracking-wider text-accent-400";
const SUBTITLE_CLASSES = "font-body text-lg text-light-300";

export function GamePausedOverlay() {
  const { t } = useTranslation();

  return (
    <div className={OVERLAY_CLASSES} role="alertdialog" aria-modal="true">
      <div className={CONTENT_CLASSES}>
        <span className={ICON_CLASSES} aria-hidden>
          ⏸️
        </span>
        <h2 className={TITLE_CLASSES}>{t("game.paused.title")}</h2>
        <p className={SUBTITLE_CLASSES}>{t("game.paused.message")}</p>
      </div>
    </div>
  );
}

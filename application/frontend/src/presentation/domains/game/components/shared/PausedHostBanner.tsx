import { useTranslation } from "react-i18next";

import { SecondaryButton } from "../../../../../presentation/shared/ui/components";

const BANNER_CLASSES =
  "w-full rounded-[var(--arcade-radius-sm)] border border-accent-500/40 bg-dark-500/60 px-4 py-3 text-center shadow-[var(--arcade-effect-glow)]";
const TITLE_CLASSES =
  "font-display text-sm uppercase tracking-wider text-accent-400";

interface PausedHostBannerProps {
  isPaused: boolean;
  onResume: () => void;
}

export function PausedHostBanner({
  isPaused,
  onResume,
}: PausedHostBannerProps) {
  const { t } = useTranslation();

  if (!isPaused) {
    return null;
  }

  return (
    <div
      className={BANNER_CLASSES}
      role="status"
      aria-live="polite"
      data-testid="paused-host-banner"
    >
      <div className={TITLE_CLASSES}>{t("game.paused.title")}</div>
      <div className="mt-2 flex justify-center">
        <SecondaryButton size="sm" onClick={onResume}>
          {t("game.hostControlMenu.resumeGame")}
        </SecondaryButton>
      </div>
    </div>
  );
}

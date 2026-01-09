import { useTranslation } from "react-i18next";

const HOST_BADGE_WRAPPER_CLASSES = "mb-4 flex justify-center";
const HOST_BADGE_CONTENT_CLASSES =
  "glass-effect inline-flex items-center gap-3 rounded-2xl border-2 border-accent-500 px-6 py-3 animate-glow";
const HOST_BADGE_ICON_CLASSES = "text-3xl animate-bounce-slow";
const HOST_BADGE_LABEL_CLASSES =
  "font-display text-sm uppercase tracking-wider text-accent-400";
const HOST_BADGE_TITLE_CLASSES =
  "font-display text-lg uppercase tracking-wider text-accent-200";

interface HostBadgeProps {
  quizTitle?: string | null;
}

export function HostBadge({ quizTitle }: HostBadgeProps) {
  const { t } = useTranslation();

  return (
    <div className={HOST_BADGE_WRAPPER_CLASSES}>
      <div className={HOST_BADGE_CONTENT_CLASSES}>
        <span className={HOST_BADGE_ICON_CLASSES} aria-hidden>
          👑
        </span>
        <div className="flex flex-col">
          <span className={HOST_BADGE_LABEL_CLASSES}>
            {t("game.hostPlaying.badgeLabel")}
          </span>
          {quizTitle ? (
            <span className={HOST_BADGE_TITLE_CLASSES}>{quizTitle}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

import { useTranslation } from "react-i18next";
import { AnimationStage } from "../constants";
import { ArcadeSectionHeader } from "../../../../../../presentation/shared/ui/components";

const TITLE_WRAPPER_CLASSES = "mb-16 animate-scale-in";
const SECTION_WRAPPER_CLASSES =
  "relative overflow-hidden rounded-3xl border-2 border-accent-500/40 bg-[color:var(--arcade-color-surface-overlay)] px-6 py-10 shadow-neon-accent";
const HALO_CLASSES =
  "pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-accent-500/25 via-primary-500/20 to-secondary-500/25 blur-3xl";

interface LeaderboardTitleProps {
  animationStage: AnimationStage;
}

export function LeaderboardTitle({ animationStage }: LeaderboardTitleProps) {
  const { t } = useTranslation();

  if (animationStage < 1) {
    return null;
  }

  return (
    <div className={TITLE_WRAPPER_CLASSES}>
      <div className={SECTION_WRAPPER_CLASSES}>
        <div className={HALO_CLASSES} aria-hidden />
        <ArcadeSectionHeader
          icon="🏆"
          eyebrow={t("game.hostLeaderboard.title.subtitle")}
          title={t("game.hostLeaderboard.title.main")}
          subtitle={t("game.hostLeaderboard.title.message")}
          align="center"
        />
      </div>
    </div>
  );
}

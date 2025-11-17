import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ArcadeBadge, ArcadePage } from "../../../../../shared/components";
import Confetti from "../../Confetti";

const CONTENT_WRAPPER_CLASSES = "relative z-30 w-full pt-28";
const CONTENT_CONTAINER_CLASSES = "mx-auto w-full max-w-6xl";

const OVERLAY_CONTENT = (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl animate-pulse-slow" />
    <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-secondary-500/10 blur-3xl animate-pulse-slow" />
    <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/5 blur-3xl animate-pulse-slow" />
  </div>
);

interface LeaderboardLayoutProps {
  showConfetti: boolean;
  children: ReactNode;
}

export function LeaderboardLayout({
  showConfetti,
  children,
}: LeaderboardLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="crt-screen">
      <ArcadePage
        variant="dark"
        padding="lg"
        contentWidth="xl"
        gap="lg"
        verticalAlign="start"
        overlays={OVERLAY_CONTENT}
      >
        {showConfetti ? <Confetti /> : null}

        <div className="relative w-full">
          <div className="pointer-events-none absolute left-1/2 top-6 z-40 -translate-x-1/2">
            <ArcadeBadge tone="accent" size="sm" pulse indicator>
              <span className="flex items-center gap-2">
                <span className="text-2xl animate-bounce-slow" aria-hidden>
                  👑
                </span>
                <span>{t("game.hostLeaderboard.badge")}</span>
              </span>
            </ArcadeBadge>
          </div>

          <div className={CONTENT_WRAPPER_CLASSES}>
            <div className={CONTENT_CONTAINER_CLASSES}>{children}</div>
          </div>
        </div>
      </ArcadePage>
    </div>
  );
}

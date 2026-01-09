import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import type { LeaderboardEntry } from "../../../../../domains/game/types";
import HostLeaderboardView from "./host/HostLeaderboardView";
import { LeaderboardLayout } from "./components/LeaderboardLayout";
import { LeaderboardHeader } from "./components/LeaderboardHeader";
import { LeaderboardPodium } from "./components/LeaderboardPodium";
import { LeaderboardAdditionalPlayers } from "./components/LeaderboardAdditionalPlayers";
import { LeaderboardActions } from "./components/LeaderboardActions";
import { useLeaderboardAnimation } from "./hooks/useLeaderboardAnimation";
import { GamePausedOverlay } from "../playing/components/GamePausedOverlay";
import { PausedHostBanner } from "../shared/PausedHostBanner";

interface LeaderboardPageProps {
  leaderboard: LeaderboardEntry[];
  isHost?: boolean;
  isPaused?: boolean;
  onTogglePause?: () => void;
}

export default function LeaderboardPage({
  leaderboard,
  isHost = false,
  isPaused = false,
  onTogglePause,
}: LeaderboardPageProps) {
  const { t } = useTranslation();

  if (isHost) {
    return (
      <>
        {onTogglePause ? (
          <PausedHostBanner isPaused={isPaused} onResume={onTogglePause} />
        ) : null}
        <HostLeaderboardView leaderboard={leaderboard} />
      </>
    );
  }
  const navigate = useNavigate();
  const { animationStage, showConfetti } = useLeaderboardAnimation();

  const additionalPlayers = leaderboard.slice(3);
  const topScore = leaderboard[0]?.totalPoints ?? 0;
  const shareTitle = t("game.leaderboardPage.share.title");
  const shareText = t("game.leaderboardPage.share.text", { score: topScore });

  return (
    <>
      <LeaderboardLayout showConfetti={showConfetti}>
        <LeaderboardHeader isVisible={animationStage >= 1} />
        <LeaderboardPodium
          entries={leaderboard}
          animationStage={animationStage}
        />
        <LeaderboardAdditionalPlayers
          entries={additionalPlayers}
          animationStage={animationStage}
        />
        <LeaderboardActions
          animationStage={animationStage}
          onPlayAgain={() => navigate("/")}
          shareTitle={shareTitle}
          shareText={shareText}
        />
      </LeaderboardLayout>

      {isPaused ? <GamePausedOverlay /> : null}
    </>
  );
}

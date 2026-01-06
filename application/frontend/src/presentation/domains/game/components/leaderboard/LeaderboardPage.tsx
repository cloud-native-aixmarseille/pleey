import { useNavigate } from "react-router-dom";

import type { LeaderboardEntry } from "../../../../../domains/game/types";
import { LeaderboardLayout } from "./components/LeaderboardLayout";
import { LeaderboardHeader } from "./components/LeaderboardHeader";
import { LeaderboardPodium } from "./components/LeaderboardPodium";
import { LeaderboardAdditionalPlayers } from "./components/LeaderboardAdditionalPlayers";
import { LeaderboardActions } from "./components/LeaderboardActions";
import { useLeaderboardAnimation } from "./hooks/useLeaderboardAnimation";

interface LeaderboardPageProps {
  leaderboard: LeaderboardEntry[];
}

export default function LeaderboardPage({ leaderboard }: LeaderboardPageProps) {
  const navigate = useNavigate();
  const { animationStage, showConfetti } = useLeaderboardAnimation();

  const additionalPlayers = leaderboard.slice(3);
  const topScore = leaderboard[0]?.totalPoints ?? 0;
  const shareTitle = "QuizMaster Results";
  const shareText = `I scored ${topScore} points in QuizMaster! 🏆 Can you beat my score?`;

  return (
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
  );
}

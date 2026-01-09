import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { LeaderboardEntry } from "../../../../../../domains/game/types";
import { useLeaderboardAnimation } from "../hooks/useLeaderboardAnimation";
import {
  DEFAULT_HOST_LEADERBOARD_ANIMATION_DELAYS,
  type HostLeaderboardAnimationDelays,
  type HostLeaderboardAnimationStage,
} from "../constants";
import { HostLeaderboardLayout } from "./components/HostLeaderboardLayout";
import { HostLeaderboardTitle } from "./components/HostLeaderboardTitle";
import { HostLeaderboardPodium } from "./components/HostLeaderboardPodium";
import { HostLeaderboardControls } from "./components/HostLeaderboardControls";
import { LeaderboardAdditionalPlayers } from "../components/LeaderboardAdditionalPlayers";

export interface HostLeaderboardViewProps {
  leaderboard: LeaderboardEntry[];
  animationDelays?: Partial<HostLeaderboardAnimationDelays>;
  initialAnimationStage?: HostLeaderboardAnimationStage;
  disableConfetti?: boolean;
}

export default function HostLeaderboardView({
  leaderboard,
  animationDelays,
  initialAnimationStage,
  disableConfetti = false,
}: HostLeaderboardViewProps) {
  const { t } = useTranslation();

  const delays = useMemo(
    () => ({
      ...DEFAULT_HOST_LEADERBOARD_ANIMATION_DELAYS,
      ...animationDelays,
    }),
    [animationDelays]
  );

  const { animationStage, showConfetti } = useLeaderboardAnimation({
    timings: {
      title: delays.title,
      firstPlace: delays.firstPlace,
      secondPlace: delays.secondPlace,
      thirdPlace: delays.thirdPlace,
      rest: delays.remainingPlayers,
      confettiStop: delays.confettiStop,
    },
    initialStage: initialAnimationStage,
    disableConfetti,
  });

  return (
    <HostLeaderboardLayout showConfetti={showConfetti}>
      <HostLeaderboardTitle animationStage={animationStage} />
      <HostLeaderboardPodium
        leaderboard={leaderboard}
        animationStage={animationStage}
      />
      <LeaderboardAdditionalPlayers
        entries={leaderboard.slice(3)}
        animationStage={animationStage}
        title={t("game.hostLeaderboard.additionalPlayers.title")}
        tone="accent"
        width="lg"
        spacing="lg"
      />
      <HostLeaderboardControls animationStage={animationStage} />
    </HostLeaderboardLayout>
  );
}

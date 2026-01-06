import { useEffect, useMemo, useState } from "react";
import type { LeaderboardEntry } from "../../../../../domains/game/types";

import {
  AnimationDelays,
  AnimationStage,
  DEFAULT_ANIMATION_DELAYS,
} from "./constants";
import { LeaderboardLayout } from "./components/LeaderboardLayout";
import { LeaderboardTitle } from "./components/LeaderboardTitle";
import { PodiumSection } from "./components/PodiumSection";
import { LeaderboardAdditionalPlayers } from "./components/LeaderboardAdditionalPlayers";
import { AdminControlPanel } from "./components/AdminControlPanel";

export interface AdminHostLeaderboardViewProps {
  leaderboard: LeaderboardEntry[];
  animationDelays?: Partial<AnimationDelays>;
  initialAnimationStage?: AnimationStage;
  disableConfetti?: boolean;
}

export default function AdminHostLeaderboardView({
  leaderboard,
  animationDelays,
  initialAnimationStage,
  disableConfetti = false,
}: AdminHostLeaderboardViewProps) {
  const [showConfetti, setShowConfetti] = useState(!disableConfetti);
  const [animationStage, setAnimationStage] = useState<AnimationStage>(
    typeof initialAnimationStage === "number" ? initialAnimationStage : 0
  );

  const delays = useMemo(
    () => ({
      ...DEFAULT_ANIMATION_DELAYS,
      ...animationDelays,
    }),
    [animationDelays]
  );

  useEffect(() => {
    if (typeof initialAnimationStage === "number") {
      setAnimationStage(initialAnimationStage);
      setShowConfetti(!disableConfetti && initialAnimationStage < 5);
      return;
    }

    const timers: Array<number | null> = [];

    const schedule = (delay: number, callback: () => void) => {
      if (delay <= 0) {
        callback();
        return null;
      }

      const timerId = window.setTimeout(callback, delay);
      return timerId;
    };

    timers.push(schedule(delays.title, () => setAnimationStage(1)));
    timers.push(schedule(delays.firstPlace, () => setAnimationStage(2)));
    timers.push(schedule(delays.secondPlace, () => setAnimationStage(3)));
    timers.push(schedule(delays.thirdPlace, () => setAnimationStage(4)));
    timers.push(schedule(delays.remainingPlayers, () => setAnimationStage(5)));
    timers.push(
      disableConfetti
        ? null
        : schedule(delays.confettiStop, () => setShowConfetti(false))
    );

    return () => {
      timers.forEach((timer) => {
        if (timer !== null) {
          clearTimeout(timer);
        }
      });
    };
  }, [delays, initialAnimationStage, disableConfetti]);

  return (
    <LeaderboardLayout showConfetti={showConfetti}>
      <LeaderboardTitle animationStage={animationStage} />
      <PodiumSection
        leaderboard={leaderboard}
        animationStage={animationStage}
      />
      <LeaderboardAdditionalPlayers
        leaderboard={leaderboard}
        animationStage={animationStage}
      />
      <AdminControlPanel animationStage={animationStage} />
    </LeaderboardLayout>
  );
}

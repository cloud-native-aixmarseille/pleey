import { useEffect, useState } from "react";

import { LEADERBOARD_ANIMATION_TIMINGS } from "../constants";

export function useLeaderboardAnimation() {
  const [animationStage, setAnimationStage] = useState(0);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => setAnimationStage(1), LEADERBOARD_ANIMATION_TIMINGS.title),
      setTimeout(() => setAnimationStage(2), LEADERBOARD_ANIMATION_TIMINGS.firstPlace),
      setTimeout(() => setAnimationStage(3), LEADERBOARD_ANIMATION_TIMINGS.secondPlace),
      setTimeout(() => setAnimationStage(4), LEADERBOARD_ANIMATION_TIMINGS.thirdPlace),
      setTimeout(() => setAnimationStage(5), LEADERBOARD_ANIMATION_TIMINGS.rest),
      setTimeout(() => setShowConfetti(false), LEADERBOARD_ANIMATION_TIMINGS.confettiStop),
    ];

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  return { animationStage, showConfetti };
}

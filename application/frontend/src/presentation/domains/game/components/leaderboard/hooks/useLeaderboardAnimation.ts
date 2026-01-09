import { useEffect, useState } from "react";

import {
  LEADERBOARD_ANIMATION_TIMINGS,
  type HostLeaderboardAnimationStage,
} from "../constants";

type LeaderboardAnimationTimings = {
  title: number;
  firstPlace: number;
  secondPlace: number;
  thirdPlace: number;
  rest: number;
  confettiStop: number;
};

interface UseLeaderboardAnimationOptions {
  timings?: LeaderboardAnimationTimings;
  initialStage?: HostLeaderboardAnimationStage;
  disableConfetti?: boolean;
}

export function useLeaderboardAnimation(options?: UseLeaderboardAnimationOptions) {
  const timings = options?.timings ?? LEADERBOARD_ANIMATION_TIMINGS;
  const disableConfetti = options?.disableConfetti ?? false;

  const [animationStage, setAnimationStage] = useState<HostLeaderboardAnimationStage>(
    options?.initialStage ?? 0
  );
  const [showConfetti, setShowConfetti] = useState(
    !disableConfetti && (options?.initialStage ?? 0) < 5
  );

  useEffect(() => {
    if (typeof options?.initialStage === "number") {
      setAnimationStage(options.initialStage);
      setShowConfetti(!disableConfetti && options.initialStage < 5);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => setAnimationStage(1), timings.title),
      setTimeout(() => setAnimationStage(2), timings.firstPlace),
      setTimeout(() => setAnimationStage(3), timings.secondPlace),
      setTimeout(() => setAnimationStage(4), timings.thirdPlace),
      setTimeout(() => setAnimationStage(5), timings.rest),
    ];

    if (!disableConfetti) {
      timers.push(setTimeout(() => setShowConfetti(false), timings.confettiStop));
    }

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [disableConfetti, options?.initialStage, timings]);

  return { animationStage, showConfetti };
}

export const LEADERBOARD_ANIMATION_TIMINGS = {
  title: 500,
  firstPlace: 1500,
  secondPlace: 2200,
  thirdPlace: 2900,
  rest: 3600,
  confettiStop: 8000,
} as const;

export type HostLeaderboardAnimationStage = 0 | 1 | 2 | 3 | 4 | 5;

export interface HostLeaderboardAnimationDelays {
  title: number;
  firstPlace: number;
  secondPlace: number;
  thirdPlace: number;
  remainingPlayers: number;
  confettiStop: number;
}

export const DEFAULT_HOST_LEADERBOARD_ANIMATION_DELAYS: HostLeaderboardAnimationDelays =
{
  title: 500,
  firstPlace: 1500,
  secondPlace: 2500,
  thirdPlace: 3500,
  remainingPlayers: 4500,
  confettiStop: 10000,
};

export const ADDITIONAL_PLAYERS_STAGE = 5;
export const ACTIONS_STAGE = 5;

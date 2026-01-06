export type AnimationStage = 0 | 1 | 2 | 3 | 4 | 5;

export interface AnimationDelays {
  title: number;
  firstPlace: number;
  secondPlace: number;
  thirdPlace: number;
  remainingPlayers: number;
  confettiStop: number;
}

export const DEFAULT_ANIMATION_DELAYS: AnimationDelays = {
  title: 500,
  firstPlace: 1500,
  secondPlace: 2500,
  thirdPlace: 3500,
  remainingPlayers: 4500,
  confettiStop: 10000,
};

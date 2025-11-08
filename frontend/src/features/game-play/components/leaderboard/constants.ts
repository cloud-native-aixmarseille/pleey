export const LEADERBOARD_ANIMATION_TIMINGS = {
  title: 500,
  firstPlace: 1500,
  secondPlace: 2200,
  thirdPlace: 2900,
  rest: 3600,
  confettiStop: 8000,
} as const;

export const PODIUM_CONFIG = {
  1: {
    pedestalGradient: "from-accent-400 to-accent-500",
    pedestalHeight: "h-56",
    pedestalScale: "scale-110",
    pedestalGlow: "shadow-neon-accent",
  },
  2: {
    pedestalGradient: "from-light-300 to-light-400",
    pedestalHeight: "h-44",
    pedestalScale: "scale-100",
    pedestalGlow: "shadow-glow",
  },
  3: {
    pedestalGradient: "from-secondary-300 to-secondary-400",
    pedestalHeight: "h-32",
    pedestalScale: "scale-95",
    pedestalGlow: "shadow-neon-secondary",
  },
} as const;

export const ADDITIONAL_PLAYERS_STAGE = 5;
export const ACTIONS_STAGE = 5;

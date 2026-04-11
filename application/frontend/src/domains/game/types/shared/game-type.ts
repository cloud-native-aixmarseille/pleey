export const GameType = {
  Prediction: 'prediction',
  Quiz: 'quiz',
} as const;

export type GameType = (typeof GameType)[keyof typeof GameType];

export type GameTypeId = number & {
  readonly __identifierBrand: 'GameTypeId';
};

export const GameType = {
  Prediction: 'prediction',
  Quiz: 'quiz',
} as const;

export type GameType = (typeof GameType)[keyof typeof GameType];

export type GameTypeId = string & {
  readonly __identifierBrand: 'GameTypeId';
};

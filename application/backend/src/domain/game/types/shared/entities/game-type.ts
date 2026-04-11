export enum GameType {
  Prediction = 'prediction',
  Quiz = 'quiz',
}

export type GameTypeId = number & {
  readonly __identifierBrand: 'GameTypeId';
};

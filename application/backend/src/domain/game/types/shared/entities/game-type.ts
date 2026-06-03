export enum GameType {
  Prediction = 'prediction',
  Quiz = 'quiz',
}

export type GameTypeId = string & {
  readonly __identifierBrand: 'GameTypeId';
};

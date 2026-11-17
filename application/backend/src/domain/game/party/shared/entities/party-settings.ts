export interface PartySettings {
  readonly questionReadingTimeSeconds: number;
  readonly allowJoiningAfterStart: boolean;
  readonly allowOptionChangeAfterVoting: boolean;
  readonly randomizeOptionOrder: boolean;
  readonly randomizeStageOrder: boolean;
}

export const DEFAULT_PARTY_SETTINGS: PartySettings = {
  questionReadingTimeSeconds: 3,
  allowJoiningAfterStart: false,
  allowOptionChangeAfterVoting: true,
  randomizeOptionOrder: false,
  randomizeStageOrder: false,
};

export const PARTY_READING_TIME_LIMITS = { min: 0, max: 30 } as const;

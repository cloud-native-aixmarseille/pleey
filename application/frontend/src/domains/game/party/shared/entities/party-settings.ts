export interface PartySettings {
  readonly allowJoiningAfterStart: boolean;
  readonly allowOptionChangeAfterVoting: boolean;
  readonly randomizeOptionOrder: boolean;
  readonly randomizeStageOrder: boolean;
}

export const DEFAULT_PARTY_SETTINGS: PartySettings = {
  allowJoiningAfterStart: false,
  allowOptionChangeAfterVoting: false,
  randomizeOptionOrder: false,
  randomizeStageOrder: false,
};

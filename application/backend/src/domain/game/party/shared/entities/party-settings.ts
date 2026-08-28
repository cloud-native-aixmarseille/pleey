export interface PartySettings {
  readonly allowOptionChangeAfterVoting: boolean;
  readonly randomizeOptionOrder: boolean;
  readonly randomizeStageOrder: boolean;
}

export const DEFAULT_PARTY_SETTINGS: PartySettings = {
  allowOptionChangeAfterVoting: false,
  randomizeOptionOrder: false,
  randomizeStageOrder: false,
};

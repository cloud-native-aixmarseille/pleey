import type { PartyActionId, PartyStageId } from '@pleey/domain/party';

export const PARTY_PLAYER_ACTION_STATE_STATUS = {
  ACKNOWLEDGED: 'acknowledged',
} as const;

type PartyPlayerActionStateStatus =
  (typeof PARTY_PLAYER_ACTION_STATE_STATUS)[keyof typeof PARTY_PLAYER_ACTION_STATE_STATUS];

export interface PartyPlayerActionState {
  readonly earnedPoints: number;
  readonly selectedActionId: PartyActionId;
  readonly stageId: PartyStageId;
  readonly stagePosition: number;
  readonly status: PartyPlayerActionStateStatus;
}

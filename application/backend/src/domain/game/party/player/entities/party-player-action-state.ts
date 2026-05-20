import type { PartyActionId } from '../../shared/entities/party-action';
import type { PartyStageId } from '../../shared/entities/party-stage';

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

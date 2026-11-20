import type { PartyActionId, PartyStageId } from '@pleey/contracts/party';
import { type PartyPlayerActionStateStatus } from '@pleey/contracts/party';

export interface PartyPlayerActionState {
  readonly earnedPoints: number;
  readonly selectedActionId: PartyActionId;
  readonly stageId: PartyStageId;
  readonly stagePosition: number;
  readonly status: PartyPlayerActionStateStatus;
}

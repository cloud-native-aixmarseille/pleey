import type { PartyActionId, PartyStageId } from '@pleey/domain/party';
import { type PartyPlayerActionStateStatus } from '@pleey/domain/party';

export interface PartyPlayerActionState {
  readonly earnedPoints: number;
  readonly selectedActionId: PartyActionId;
  readonly stageId: PartyStageId;
  readonly stagePosition: number;
  readonly status: PartyPlayerActionStateStatus;
}

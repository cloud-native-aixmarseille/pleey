import type { GameId } from '../../../entities/game';
import type { PartyId, PartyPin } from '../../shared/entities/party';
import type { PartyActionId } from '../../shared/entities/party-action';
import type {
  PartyJoiningPlayerIdentity,
  PartyPlayerIdentity,
} from '../../shared/entities/party-player-identity';

export interface PartyJoinCommand {
  readonly pin: PartyPin;
  readonly playerIdentity: PartyJoiningPlayerIdentity;
  readonly username?: string;
}

export interface PartySubmitActionCommand {
  readonly actionId: PartyActionId;
  readonly partyId: PartyId;
}

interface PartyJoinPlayerReceipt {
  readonly avatarUri: string | null;
  readonly identity: PartyPlayerIdentity;
  readonly username: string;
}

export enum PartyJoinReceiptStatus {
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export type PartyJoinReceipt =
  | {
      readonly gameId: GameId;
      readonly player: PartyJoinPlayerReceipt;
      readonly partyId: PartyId;
      readonly pin: PartyPin;
      readonly status: PartyJoinReceiptStatus.ACCEPTED;
    }
  | {
      readonly errorMessage: string;
      readonly status: PartyJoinReceiptStatus.REJECTED;
    };

export interface PartyPlayerPort {
  joinParty(command: PartyJoinCommand): Promise<PartyJoinReceipt>;
  leaveParty(): Promise<boolean>;
  rejoinParty(command: PartyJoinCommand): Promise<PartyJoinReceipt>;
  submitAction(command: PartySubmitActionCommand): Promise<void>;
}

export const PartyPlayerPortToken = Symbol('PartyPlayerPort');

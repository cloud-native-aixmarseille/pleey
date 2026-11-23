import type { GameId } from '@pleey/domain/game';
import type { PartyActionId, PartyId, PartyPin } from '@pleey/domain/party';
import { PartyJoinReceiptStatus } from '@pleey/domain/party';
import type { PartyJoiningPlayerIdentity, PartyPlayerIdentity } from '../../shared/entities/party-player-identity';

export interface PartyJoinCommand {
  readonly guestCredential?: string;
  readonly avatarSeed?: string;
  readonly partyPassword?: string;
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

export type PartyJoinReceipt =
  | {
      readonly gameId: GameId;
      readonly guestCredential?: string;
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

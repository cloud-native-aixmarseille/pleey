import type {
  PartyJoinReceipt,
  PartySubmitActionCommand,
} from '../../../../domains/game/party/player/ports/party-player.port';
import { PartyJoinReceiptStatus } from '../../../../domains/game/party/player/ports/party-player.port';
import type { PartyId, PartyPin } from '../../../../domains/game/party/shared/entities/party';
import type { PartyObservation } from '../../../../domains/game/party/shared/entities/party-observation';
import type { PartyRuntimeNoticeKind } from '../../../../domains/game/party/shared/ports/party-observation.port';
import type { GameType } from '../../../../domains/game/types/shared/game-type';
import type { GuestId } from '../../../../domains/identity/entities/guest';
import type { UserId } from '../../../../domains/identity/entities/user';

export type PartyObservationPayload = Omit<PartyObservation, 'gameType'> & {
  readonly gameType: GameType;
};

type AcceptedPartyJoinMessage = Extract<
  PartyJoinReceipt,
  { status: PartyJoinReceiptStatus.ACCEPTED }
>;

export type PartyJoinMessage =
  | AcceptedPartyJoinMessage
  | {
      readonly errorCode: string;
      readonly status: PartyJoinReceiptStatus.REJECTED;
    };

export interface SocketExceptionPayload {
  readonly message?: string | readonly string[];
}

export interface SocketPartyRuntimeNoticePayload {
  readonly kind?: PartyRuntimeNoticeKind;
  readonly partyId?: PartyId;
}

export interface ObservePartyPayload {
  readonly partyId?: PartyId;
}

export type SocketPartyHostPlayerPayload =
  | {
      readonly partyId: PartyId;
      readonly userId: UserId;
    }
  | {
      readonly partyId: PartyId;
      readonly guestId: GuestId;
    };

export interface SocketPartyEntryPayload {
  readonly avatarSeed?: string;
  readonly guestId?: GuestId;
  readonly pin: PartyPin;
  readonly username?: string;
}

export interface SocketIoPartyObservationTransportHandlers {
  readonly onError?: (message: string) => void;
  readonly onRuntimeNotice?: (payload: SocketPartyRuntimeNoticePayload) => void;
  readonly onSnapshot: (payload: PartyObservationPayload) => void;
}

export enum SocketIoPartyObservationEventName {
  ObserveParty = 'observe-party',
  StopObservingParty = 'stop-observing-party',
}

export enum SocketIoPartyInboundEventName {
  Connect = 'connect',
  ConnectError = 'connect_error',
  Disconnect = 'disconnect',
  Exception = 'exception',
  PartyRuntimeNotice = 'party-runtime-notice',
  PartySnapshot = 'party-snapshot',
  PartyUpdated = 'party-updated',
}

export enum SocketIoPartyJoinEventName {
  JoinParty = 'join-party',
  LeaveParty = 'leave-party',
  RejoinParty = 'rejoin-party',
}

export enum SocketIoPartyHostCommandEventName {
  AdvanceStage = 'advance-stage',
  EndParty = 'end-party',
  KickPlayer = 'kick-player',
  PauseParty = 'pause-party',
  RestartStage = 'restart-stage',
  ResumeParty = 'resume-party',
  RevealStageResult = 'reveal-stage-result',
  RewindParty = 'rewind-party',
  RewindStage = 'rewind-stage',
  StartParty = 'start-party',
}

export enum SocketIoPartyPlayerCommandEventName {
  SubmitAction = 'submit-action',
}

export interface SocketIoPartyPlayerCommand {
  readonly eventName: SocketIoPartyPlayerCommandEventName;
  readonly command: PartySubmitActionCommand;
}

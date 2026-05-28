import type { PartyId } from '../../shared/entities/party';
import type { PartyPlayerIdentity } from '../../shared/entities/party-player-identity';

export interface HostPartyControlCommand {
  readonly partyId: PartyId;
}

export interface HostPartyPlayerControlCommand extends HostPartyControlCommand {
  readonly playerIdentity: PartyPlayerIdentity;
}

export interface PartyHostControlPort {
  advanceStage(command: HostPartyControlCommand): Promise<void>;
  endParty(command: HostPartyControlCommand): Promise<void>;
  kickPlayer(command: HostPartyPlayerControlCommand): Promise<void>;
  pauseParty(command: HostPartyControlCommand): Promise<void>;
  restartStage(command: HostPartyControlCommand): Promise<void>;
  resumeParty(command: HostPartyControlCommand): Promise<void>;
  revealStageResult(command: HostPartyControlCommand): Promise<void>;
  rewindParty(command: HostPartyControlCommand): Promise<void>;
  rewindStage(command: HostPartyControlCommand): Promise<void>;
  startParty(command: HostPartyControlCommand): Promise<void>;
}

export const PartyHostControlPortToken = Symbol('PartyHostControlPort');

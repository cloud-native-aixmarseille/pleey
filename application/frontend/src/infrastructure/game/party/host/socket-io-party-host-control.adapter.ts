import { inject, injectable } from 'inversify';
import type {
  HostPartyControlCommand,
  HostPartyPlayerControlCommand,
  PartyHostControlPort,
} from '../../../../domains/game/party/host/ports/party-host-control.port';
import { PartyPlayerIdentityKind } from '../../../../domains/game/party/shared/entities/party-player-identity';
import { SocketIoPartyHostCommandEventName } from '../shared/socket-io-party-realtime.types';
import { SocketIoPartyRealtimeTransport } from '../shared/socket-io-party-realtime-transport';

@injectable()
export class SocketIoPartyHostControlAdapter implements PartyHostControlPort {
  constructor(
    @inject(SocketIoPartyRealtimeTransport)
    private readonly realtimeTransport: SocketIoPartyRealtimeTransport,
  ) {}

  advanceStage(command: HostPartyControlCommand): Promise<void> {
    return this.realtimeTransport.dispatchHostCommand(
      SocketIoPartyHostCommandEventName.AdvanceStage,
      { partyId: command.partyId },
    );
  }

  endParty(command: HostPartyControlCommand): Promise<void> {
    return this.realtimeTransport.dispatchHostCommand(SocketIoPartyHostCommandEventName.EndParty, {
      partyId: command.partyId,
    });
  }

  kickPlayer(command: HostPartyPlayerControlCommand): Promise<void> {
    return this.realtimeTransport.dispatchHostCommand(
      SocketIoPartyHostCommandEventName.KickPlayer,
      command.playerIdentity.kind === PartyPlayerIdentityKind.User
        ? {
            partyId: command.partyId,
            userId: command.playerIdentity.userId,
          }
        : {
            guestId: command.playerIdentity.guestId,
            partyId: command.partyId,
          },
    );
  }

  pauseParty(command: HostPartyControlCommand): Promise<void> {
    return this.realtimeTransport.dispatchHostCommand(
      SocketIoPartyHostCommandEventName.PauseParty,
      { partyId: command.partyId },
    );
  }

  restartStage(command: HostPartyControlCommand): Promise<void> {
    return this.realtimeTransport.dispatchHostCommand(
      SocketIoPartyHostCommandEventName.RestartStage,
      { partyId: command.partyId },
    );
  }

  resumeParty(command: HostPartyControlCommand): Promise<void> {
    return this.realtimeTransport.dispatchHostCommand(
      SocketIoPartyHostCommandEventName.ResumeParty,
      { partyId: command.partyId },
    );
  }

  revealStageResult(command: HostPartyControlCommand): Promise<void> {
    return this.realtimeTransport.dispatchHostCommand(
      SocketIoPartyHostCommandEventName.RevealStageResult,
      { partyId: command.partyId },
    );
  }

  rewindParty(command: HostPartyControlCommand): Promise<void> {
    return this.realtimeTransport.dispatchHostCommand(
      SocketIoPartyHostCommandEventName.RewindParty,
      { partyId: command.partyId },
    );
  }

  rewindStage(command: HostPartyControlCommand): Promise<void> {
    return this.realtimeTransport.dispatchHostCommand(
      SocketIoPartyHostCommandEventName.RewindStage,
      { partyId: command.partyId },
    );
  }

  startParty(command: HostPartyControlCommand): Promise<void> {
    return this.realtimeTransport.dispatchHostCommand(
      SocketIoPartyHostCommandEventName.StartParty,
      { partyId: command.partyId },
    );
  }
}

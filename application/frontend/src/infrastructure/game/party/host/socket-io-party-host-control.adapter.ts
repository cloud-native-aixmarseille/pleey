import { inject, injectable } from 'inversify';
import type {
  HostPartyControlCommand,
  PartyHostControlPort,
} from '../../../../domains/game/party/host/ports/party-host-control.port';
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
      command.partyId,
    );
  }

  endParty(command: HostPartyControlCommand): Promise<void> {
    return this.realtimeTransport.dispatchHostCommand(
      SocketIoPartyHostCommandEventName.EndParty,
      command.partyId,
    );
  }

  pauseParty(command: HostPartyControlCommand): Promise<void> {
    return this.realtimeTransport.dispatchHostCommand(
      SocketIoPartyHostCommandEventName.PauseParty,
      command.partyId,
    );
  }

  restartStage(command: HostPartyControlCommand): Promise<void> {
    return this.realtimeTransport.dispatchHostCommand(
      SocketIoPartyHostCommandEventName.RestartStage,
      command.partyId,
    );
  }

  resumeParty(command: HostPartyControlCommand): Promise<void> {
    return this.realtimeTransport.dispatchHostCommand(
      SocketIoPartyHostCommandEventName.ResumeParty,
      command.partyId,
    );
  }

  revealStageResult(command: HostPartyControlCommand): Promise<void> {
    return this.realtimeTransport.dispatchHostCommand(
      SocketIoPartyHostCommandEventName.RevealStageResult,
      command.partyId,
    );
  }

  rewindParty(command: HostPartyControlCommand): Promise<void> {
    return this.realtimeTransport.dispatchHostCommand(
      SocketIoPartyHostCommandEventName.RewindParty,
      command.partyId,
    );
  }

  rewindStage(command: HostPartyControlCommand): Promise<void> {
    return this.realtimeTransport.dispatchHostCommand(
      SocketIoPartyHostCommandEventName.RewindStage,
      command.partyId,
    );
  }

  startParty(command: HostPartyControlCommand): Promise<void> {
    return this.realtimeTransport.dispatchHostCommand(
      SocketIoPartyHostCommandEventName.StartParty,
      command.partyId,
    );
  }
}

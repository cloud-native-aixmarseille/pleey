import { inject, injectable } from 'inversify';
import type {
  PartyJoinCommand,
  PartyJoinReceipt,
  PartyPlayerPort,
  PartySubmitActionCommand,
} from '../../../../domains/game/party/player/ports/party-player.port';
import { PartyPlayerIdentityKind } from '../../../../domains/game/party/shared/entities/party-player-identity';
import { SocketIoPartyPayloadMapper } from '../shared/socket-io-party-payload-mapper';
import {
  SocketIoPartyJoinEventName,
  SocketIoPartyPlayerCommandEventName,
  type SocketPartyEntryPayload,
} from '../shared/socket-io-party-realtime.types';
import { SocketIoPartyRealtimeTransport } from '../shared/socket-io-party-realtime-transport';

@injectable()
export class SocketIoPartyPlayerAdapter implements PartyPlayerPort {
  constructor(
    @inject(SocketIoPartyPayloadMapper)
    private readonly payloadMapper: SocketIoPartyPayloadMapper,
    @inject(SocketIoPartyRealtimeTransport)
    private readonly realtimeTransport: SocketIoPartyRealtimeTransport,
  ) {}

  async joinParty(command: PartyJoinCommand): Promise<PartyJoinReceipt> {
    const response = await this.realtimeTransport.dispatchPartyJoinCommand(
      SocketIoPartyJoinEventName.JoinParty,
      this.toSocketPartyEntryPayload(command),
    );

    return this.payloadMapper.toPartyJoinReceipt(response);
  }

  leaveParty(): Promise<boolean> {
    return this.realtimeTransport.leaveParty();
  }

  async rejoinParty(command: PartyJoinCommand): Promise<PartyJoinReceipt> {
    const response = await this.realtimeTransport.dispatchPartyJoinCommand(
      SocketIoPartyJoinEventName.RejoinParty,
      this.toSocketPartyEntryPayload(command),
    );

    return this.payloadMapper.toPartyJoinReceipt(response);
  }

  submitAction(command: PartySubmitActionCommand): Promise<void> {
    return this.realtimeTransport.dispatchPlayerCommand({
      command,
      eventName: SocketIoPartyPlayerCommandEventName.SubmitAction,
    });
  }

  private toSocketPartyEntryPayload(command: PartyJoinCommand): SocketPartyEntryPayload {
    return {
      avatarSeed: command.avatarSeed,
      guestId:
        command.playerIdentity.kind === PartyPlayerIdentityKind.Guest
          ? command.playerIdentity.guestId
          : undefined,
      pin: command.pin,
      username: command.username,
    };
  }
}

import { inject, injectable } from 'inversify';
import type { PartyId } from '../../../../domains/game/party/shared/entities/party';
import {
  type PartyObservationConnectionState,
  type PartyObservationHandlers,
  type PartyObservationPort,
} from '../../../../domains/game/party/shared/ports/party-observation.port';
import { SocketIoPartyPayloadMapper } from './socket-io-party-payload-mapper';
import { SocketIoPartyRealtimeTransport } from './socket-io-party-realtime-transport';

@injectable()
export class SocketIoPartyObservationAdapter implements PartyObservationPort {
  constructor(
    @inject(SocketIoPartyPayloadMapper)
    private readonly payloadMapper: SocketIoPartyPayloadMapper,
    @inject(SocketIoPartyRealtimeTransport)
    private readonly realtimeTransport: SocketIoPartyRealtimeTransport,
  ) {}

  observeParty(partyId: PartyId, handlers: PartyObservationHandlers): () => void {
    return this.realtimeTransport.observeParty(partyId, {
      onConnected: (state) => {
        handlers.onConnected?.(this.toConnectionState(state));
      },
      onError: handlers.onError,
      onRuntimeNotice: (payload) => {
        const runtimeNotice = this.payloadMapper.toRuntimeNotice(payload);

        if (runtimeNotice) {
          handlers.onRuntimeNotice?.(runtimeNotice);
        }
      },
      onSnapshot: (payload) => {
        handlers.onSnapshot(this.payloadMapper.toObservation(payload));
      },
    });
  }

  private toConnectionState(state: {
    readonly recovered: boolean;
    readonly reconnected: boolean;
  }): PartyObservationConnectionState {
    return {
      epoch: Date.now(),
      recovered: state.recovered,
      reconnected: state.reconnected,
    };
  }
}

import type { GameId } from '../../../entities/game';
import type { PartyStatus } from '../../enums/party-status.enum';
import type { PartyPlayer } from '../../player/entities/party-player';
import type { PartyId, PartyPin } from '../../shared/entities/party';
import type { PartyRuntimeContext } from '../../shared/entities/party-runtime-context';
import type { PartyHost } from './party-host';

export interface HostPartyObservation {
  readonly partyId: PartyId;
  readonly gameId: GameId;
  readonly pin: PartyPin;
  readonly status: PartyStatus;
  readonly host: PartyHost;
  readonly players: readonly PartyPlayer[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly context: PartyRuntimeContext | null;
}

import type { GameType } from '../../../types/shared/game-type';
import type { PartyId, PartyPin } from './party';
import type { PartyHost } from './party-host';
import type { PartyObservationPlayer } from './party-observation-player';
import type { PartyRuntimeContext } from './party-runtime-context';
import type { PartyStatus } from './party-status';

export interface PartyObservation {
  readonly partyId: PartyId;
  readonly gameType: GameType;
  readonly pin: PartyPin;
  readonly status: PartyStatus;
  readonly context: PartyRuntimeContext | null;
  readonly isObserverHost: boolean;
  readonly host: PartyHost;
  readonly players: readonly PartyObservationPlayer[];
}

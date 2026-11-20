import type { GameId } from '@pleey/contracts/game';
import type { PartyId, PartyPin, PartySettings, PartyStatus } from '@pleey/contracts/party';
import type { ThemeDocument } from '@pleey/contracts/theme';
import type { PartyPlayer } from '../../player/entities/party-player';
import type { PartyRuntimeContext } from '../../shared/entities/party-runtime-context';
import type { PartyHost } from './party-host';

export interface HostPartyObservation {
  readonly isPrivate: boolean;
  readonly partyId: PartyId;
  readonly gameId: GameId;
  readonly pin: PartyPin;
  readonly status: PartyStatus;
  readonly settings: PartySettings;
  readonly themeDocument: ThemeDocument;
  readonly host: PartyHost;
  readonly players: readonly PartyPlayer[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly context: PartyRuntimeContext | null;
}

import type { GameId } from '@pleey/domain/game';
import type { PartyId, PartyPin, PartySettings, PartyStatus } from '@pleey/domain/party';
import type { ThemeDocument } from '../../../../theme/entities/theme-document';
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

import type { GameType } from '@pleey/domain/game';
import type { PartySettings, PartyStatus } from '@pleey/domain/party';
import type { ThemeDocument } from '../../../../theme/entities/theme-document';
import type { HostPartyPermissions } from '../../host/value-objects/host-party-permissions';
import type { PartyId, PartyPin } from './party';
import type { PartyHost } from './party-host';
import type { PartyObservationPlayer } from './party-observation-player';
import type { PartyRuntimeContext } from './party-runtime-context';

export interface PartyObservation {
  readonly permissions: HostPartyPermissions;
  readonly partyId: PartyId;
  readonly gameType: GameType;
  readonly pin: PartyPin;
  readonly status: PartyStatus;
  readonly settings: PartySettings;
  readonly themeDocument: ThemeDocument;
  readonly context: PartyRuntimeContext | null;
  readonly isObserverHost: boolean;
  readonly host: PartyHost;
  readonly players: readonly PartyObservationPlayer[];
}

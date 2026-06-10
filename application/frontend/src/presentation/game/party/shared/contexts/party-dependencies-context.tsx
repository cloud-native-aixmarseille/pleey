import { createContext, createElement, type ReactElement, type ReactNode, useContext } from 'react';
import type { PartyLobbyGateway } from '../../../../../application/game/party/shared/facades/party-lobby.facade';
import type { PartyHostControlPort } from '../../../../../domains/game/party/host/ports/party-host-control.port';
import type { PartyHostRuntimeControlsPort } from '../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import type { PartyManagementPort } from '../../../../../domains/game/party/host/ports/party-management.port';
import type { PartyGuestSessionPort } from '../../../../../domains/game/party/player/ports/party-guest-session.port';
import type { PartyPlayerPort } from '../../../../../domains/game/party/player/ports/party-player.port';
import type { PartyId, PartyPin } from '../../../../../domains/game/party/shared/entities/party';
import type { StageId } from '../../../../../domains/game/party/shared/entities/party-stage';
import type { PartyObservationPort } from '../../../../../domains/game/party/shared/ports/party-observation.port';
import type { PrivatePartyPasswordGeneratorPort } from '../../../../../domains/game/party/shared/ports/private-party-password-generator.port';
import { PresentationContextErrorCode } from '../../../../../domains/shared/errors/presentation-context-error-code';
import { PlayerRuntimeNoticeMessageResolver } from '../../player/screens/components/player-runtime-notice-message-resolver';
import { GuestPartyEntryDraftFactory } from '../../player/screens/guest-party-entry-draft-factory';
import { PartyLobbyRuntimeRedirectResolver } from '../screens/party-lobby-runtime-redirect-resolver';

export interface PartyIdParser {
  parseOrNull(value: unknown): PartyId | null;
}

export interface PartyPinParser {
  parseOrNull(value: unknown): PartyPin | null;
}

export interface StageIdParser {
  parseOrNull(value: unknown): StageId | null;
}

export interface PartyDependencies {
  readonly guestPartyEntryDraftFactory: GuestPartyEntryDraftFactory;
  readonly hostPartyRuntimeControlsResolver: PartyHostRuntimeControlsPort;
  readonly partyIdentifier: PartyIdParser;
  readonly partyLobbyFacade: PartyLobbyGateway;
  readonly partyLobbyRuntimeRedirectResolver: PartyLobbyRuntimeRedirectResolver;
  readonly partyGuestSessionPort: PartyGuestSessionPort;
  readonly partyHostControlPort: PartyHostControlPort;
  readonly partyManagementPort: PartyManagementPort;
  readonly partyPlayerPort: PartyPlayerPort;
  readonly partyObservationPort: PartyObservationPort;
  readonly partyPinIdentifier: PartyPinParser;
  readonly playerRuntimeNoticeMessageResolver: PlayerRuntimeNoticeMessageResolver;
  readonly privatePartyPasswordGeneratorPort: PrivatePartyPasswordGeneratorPort;
  readonly stageIdentifier: StageIdParser;
}

const PartyDependenciesContext = createContext<PartyDependencies | null>(null);

export function providePartyDependencies(
  children: ReactNode,
  value: PartyDependencies,
): ReactElement {
  return createElement(PartyDependenciesContext.Provider, { value }, children);
}

export function usePartyDependencies(): PartyDependencies {
  const dependencies = useContext(PartyDependenciesContext);

  if (!dependencies) {
    throw new Error(PresentationContextErrorCode.PRESENTATION_RUNTIME_DEPENDENCY_PROVIDER_REQUIRED);
  }

  return dependencies;
}

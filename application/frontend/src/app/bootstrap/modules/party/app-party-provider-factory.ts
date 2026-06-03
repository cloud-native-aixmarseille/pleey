import { inject, injectable } from 'inversify';
import { createElement, type PropsWithChildren, type ReactNode } from 'react';
import type { PartyLobbyGateway } from '../../../../application/game/party/shared/facades/party-lobby.facade';
import { PartyLobbyFacade } from '../../../../application/game/party/shared/facades/party-lobby.facade';
import { PartyIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-identifier';
import { PartyPinIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-pin-identifier';
import { StageIdentifier } from '../../../../application/game/party/shared/services/identifiers/stage-identifier';
import type { PartyHostControlPort } from '../../../../domains/game/party/host/ports/party-host-control.port';
import { PartyHostControlPortToken } from '../../../../domains/game/party/host/ports/party-host-control.port';
import type { PartyHostRuntimeControlsPort } from '../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import { PartyHostRuntimeControlsPortToken } from '../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import type { PartyManagementPort } from '../../../../domains/game/party/host/ports/party-management.port';
import { PartyManagementPortToken } from '../../../../domains/game/party/host/ports/party-management.port';
import type { PartyGuestSessionPort } from '../../../../domains/game/party/player/ports/party-guest-session.port';
import { PartyGuestSessionPortToken } from '../../../../domains/game/party/player/ports/party-guest-session.port';
import type { PartyPlayerPort } from '../../../../domains/game/party/player/ports/party-player.port';
import { PartyPlayerPortToken } from '../../../../domains/game/party/player/ports/party-player.port';
import type { PartyObservationPort } from '../../../../domains/game/party/shared/ports/party-observation.port';
import { PartyObservationPortToken } from '../../../../domains/game/party/shared/ports/party-observation.port';
import { PlayerRuntimeNoticeMessageResolver } from '../../../../presentation/game/party/player/screens/components/player-runtime-notice-message-resolver';
import { GuestPartyEntryDraftFactory } from '../../../../presentation/game/party/player/screens/guest-party-entry-draft-factory';
import { PartyProvider } from '../../../../presentation/game/party/shared/contexts/party-context';
import {
  type PartyDependencies,
  providePartyDependencies,
} from '../../../../presentation/game/party/shared/contexts/party-dependencies-context';
import { PartyGameTypeRuntimeRegistryProvider } from '../../../../presentation/game/party/shared/contexts/party-game-type-runtime-registry-context';
import { PartyLobbyRuntimeRedirectResolver } from '../../../../presentation/game/party/shared/screens/party-lobby-runtime-redirect-resolver';
import { AppProviderOrder, BaseAppProviderFactory } from '../../app-provider-factory';
import { AppPartyGameTypeRuntimeRegistry } from './services/app-party-game-type-runtime-registry';

interface AppPartyProviderProps extends PropsWithChildren {
  readonly dependencies: PartyDependencies;
  readonly runtimeRegistry: AppPartyGameTypeRuntimeRegistry;
}

function AppPartyProvider({ children, dependencies, runtimeRegistry }: AppPartyProviderProps) {
  return createElement(
    PartyGameTypeRuntimeRegistryProvider,
    { value: runtimeRegistry },
    providePartyDependencies(
      createElement(PartyProvider, { port: dependencies.partyObservationPort }, children),
      dependencies,
    ),
  );
}

@injectable()
export class AppPartyProviderFactory extends BaseAppProviderFactory {
  readonly order = AppProviderOrder.PARTY;

  constructor(
    @inject(GuestPartyEntryDraftFactory)
    private readonly guestPartyEntryDraftFactory: GuestPartyEntryDraftFactory,
    @inject(PartyIdentifier)
    private readonly partyIdentifier: PartyIdentifier,
    @inject(PartyGuestSessionPortToken)
    private readonly partyGuestSessionPort: PartyGuestSessionPort,
    @inject(PartyHostRuntimeControlsPortToken)
    private readonly hostPartyRuntimeControlsResolver: PartyHostRuntimeControlsPort,
    @inject(PartyHostControlPortToken)
    private readonly partyHostControlPort: PartyHostControlPort,
    @inject(PartyManagementPortToken)
    private readonly partyManagementPort: PartyManagementPort,
    @inject(PartyPlayerPortToken)
    private readonly partyPlayerPort: PartyPlayerPort,
    @inject(PartyObservationPortToken)
    private readonly partyObservationPort: PartyObservationPort,
    @inject(PartyLobbyFacade)
    private readonly partyLobbyFacade: PartyLobbyGateway,
    @inject(PartyLobbyRuntimeRedirectResolver)
    private readonly partyLobbyRuntimeRedirectResolver: PartyLobbyRuntimeRedirectResolver,
    @inject(PartyPinIdentifier)
    private readonly partyPinIdentifier: PartyPinIdentifier,
    @inject(PlayerRuntimeNoticeMessageResolver)
    private readonly playerRuntimeNoticeMessageResolver: PlayerRuntimeNoticeMessageResolver,
    @inject(StageIdentifier)
    private readonly stageIdentifier: StageIdentifier,
    @inject(AppPartyGameTypeRuntimeRegistry)
    private readonly runtimeRegistry: AppPartyGameTypeRuntimeRegistry,
  ) {
    super();
  }

  protected create(children: ReactNode): ReactNode {
    const dependencies: PartyDependencies = {
      guestPartyEntryDraftFactory: this.guestPartyEntryDraftFactory,
      hostPartyRuntimeControlsResolver: this.hostPartyRuntimeControlsResolver,
      partyIdentifier: this.partyIdentifier,
      partyLobbyFacade: this.partyLobbyFacade,
      partyLobbyRuntimeRedirectResolver: this.partyLobbyRuntimeRedirectResolver,
      partyGuestSessionPort: this.partyGuestSessionPort,
      partyHostControlPort: this.partyHostControlPort,
      partyManagementPort: this.partyManagementPort,
      partyPlayerPort: this.partyPlayerPort,
      partyObservationPort: this.partyObservationPort,
      partyPinIdentifier: this.partyPinIdentifier,
      playerRuntimeNoticeMessageResolver: this.playerRuntimeNoticeMessageResolver,
      stageIdentifier: this.stageIdentifier,
    };

    return createElement(
      AppPartyProvider,
      { dependencies, runtimeRegistry: this.runtimeRegistry },
      children,
    );
  }
}

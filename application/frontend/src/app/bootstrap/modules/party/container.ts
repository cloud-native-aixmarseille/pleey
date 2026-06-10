import { ContainerModule } from 'inversify';
import { HostPartyRuntimeControlsResolver } from '../../../../application/game/party/host/services/host-party-runtime-controls-resolver';
import { CreatePartyUseCase } from '../../../../application/game/party/host/use-cases/create-party-use-case';
import { ListPartiesUseCase } from '../../../../application/game/party/host/use-cases/list-parties-use-case';
import { PartyLobbyFacade } from '../../../../application/game/party/shared/facades/party-lobby.facade';
import { PartyActionIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-action-identifier';
import { PartyIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-identifier';
import { PartyPinIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-pin-identifier';
import { StageIdentifier } from '../../../../application/game/party/shared/services/identifiers/stage-identifier';
import { PartyRouteService } from '../../../../application/game/party/shared/services/party-route.service';
import { GameTypeParser } from '../../../../application/game/types/shared/services/game-type-parser';
import {
  ROUTE_FACTORY,
  type RouteFactory,
} from '../../../../application/shared/contracts/routing.port';
import {
  type PartyHostControlPort,
  PartyHostControlPortToken,
} from '../../../../domains/game/party/host/ports/party-host-control.port';
import {
  type PartyHostRuntimeControlsPort,
  PartyHostRuntimeControlsPortToken,
} from '../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import {
  type PartyManagementPort,
  PartyManagementPortToken,
} from '../../../../domains/game/party/host/ports/party-management.port';
import {
  type GuestUsernameGeneratorPort,
  GuestUsernameGeneratorPortToken,
} from '../../../../domains/game/party/player/ports/guest-username-generator.port';
import {
  type PartyGuestSessionPort,
  PartyGuestSessionPortToken,
} from '../../../../domains/game/party/player/ports/party-guest-session.port';
import {
  type PartyPlayerPort,
  PartyPlayerPortToken,
} from '../../../../domains/game/party/player/ports/party-player.port';
import {
  type PartyObservationPort,
  PartyObservationPortToken,
} from '../../../../domains/game/party/shared/ports/party-observation.port';
import {
  type PrivatePartyPasswordGeneratorPort,
  PrivatePartyPasswordGeneratorPortToken,
} from '../../../../domains/game/party/shared/ports/private-party-password-generator.port';
import { CryptoPrivatePartyPasswordGeneratorAdapter } from '../../../../infrastructure/game/party/crypto-private-party-password-generator.adapter';
import { GraphqlPartyManagementAdapter } from '../../../../infrastructure/game/party/host/graphql-party-management.adapter';
import { SocketIoPartyHostControlAdapter } from '../../../../infrastructure/game/party/host/socket-io-party-host-control.adapter';
import { PersistedPartyGuestSessionAdapter } from '../../../../infrastructure/game/party/player/persisted-party-guest-session.adapter';
import { SocketIoPartyPlayerAdapter } from '../../../../infrastructure/game/party/player/socket-io-party-player.adapter';
import { UniqueUsernameGuestUsernameGeneratorAdapter } from '../../../../infrastructure/game/party/player/unique-username-guest-username-generator.adapter';
import { SocketIoPartyObservationAdapter } from '../../../../infrastructure/game/party/shared/socket-io-party-observation.adapter';
import { SocketIoPartyPayloadMapper } from '../../../../infrastructure/game/party/shared/socket-io-party-payload-mapper';
import { SocketIoPartyRealtimeTransport } from '../../../../infrastructure/game/party/shared/socket-io-party-realtime-transport';
import { PlayerRuntimeNoticeMessageResolver } from '../../../../presentation/game/party/player/screens/components/player-runtime-notice-message-resolver';
import { GuestPartyEntryDraftFactory } from '../../../../presentation/game/party/player/screens/guest-party-entry-draft-factory';
import { PartyRoutesFactory } from '../../../../presentation/game/party/shared/routes/party-routes-factory';
import { PartyLobbyRuntimeRedirectResolver } from '../../../../presentation/game/party/shared/screens/party-lobby-runtime-redirect-resolver';
import { AppProviderFactoryToken } from '../../app-provider-factory';
import { AppPartyProviderFactory } from './app-party-provider-factory';
import { PartyGameTypeRuntimeViewContributorToken } from './contracts/party-game-type-runtime-view-contributor';
import { AppPartyGameTypeRuntimeRegistry } from './services/app-party-game-type-runtime-registry';
import { PredictionPartyGameTypeRuntimeView } from './services/prediction-party-game-type-runtime-view';
import { QuizPartyGameTypeRuntimeView } from './services/quiz-party-game-type-runtime-view';

export const partyContainerModule = new ContainerModule(({ bind }) => {
  bind(AppPartyProviderFactory).toSelf().inSingletonScope();
  bind(AppPartyGameTypeRuntimeRegistry).toSelf().inSingletonScope();
  bind(PartyIdentifier)
    .toDynamicValue(() => new PartyIdentifier())
    .inSingletonScope();
  bind(PartyPinIdentifier)
    .toDynamicValue(() => new PartyPinIdentifier())
    .inSingletonScope();
  bind(PartyActionIdentifier)
    .toDynamicValue(() => new PartyActionIdentifier())
    .inSingletonScope();
  bind(StageIdentifier)
    .toDynamicValue(() => new StageIdentifier())
    .inSingletonScope();
  bind(GameTypeParser)
    .toDynamicValue(() => new GameTypeParser())
    .inSingletonScope();
  bind(GraphqlPartyManagementAdapter).toSelf().inSingletonScope();
  bind(PartyRouteService).toSelf().inSingletonScope();
  bind(PartyRoutesFactory).toSelf().inSingletonScope();
  bind(PersistedPartyGuestSessionAdapter).toSelf().inSingletonScope();
  bind(SocketIoPartyHostControlAdapter).toSelf().inSingletonScope();
  bind(SocketIoPartyObservationAdapter).toSelf().inSingletonScope();
  bind(SocketIoPartyPayloadMapper).toSelf().inSingletonScope();
  bind(SocketIoPartyPlayerAdapter).toSelf().inSingletonScope();
  bind(UniqueUsernameGuestUsernameGeneratorAdapter).toSelf().inSingletonScope();
  bind(CryptoPrivatePartyPasswordGeneratorAdapter).toSelf().inSingletonScope();
  bind(SocketIoPartyRealtimeTransport).toSelf().inSingletonScope();
  bind(GuestPartyEntryDraftFactory).toSelf().inSingletonScope();
  bind(PlayerRuntimeNoticeMessageResolver).toSelf().inSingletonScope();
  bind(PredictionPartyGameTypeRuntimeView).toSelf().inSingletonScope();
  bind(QuizPartyGameTypeRuntimeView).toSelf().inSingletonScope();
  bind(HostPartyRuntimeControlsResolver).toSelf().inSingletonScope();
  bind(PartyLobbyFacade).toSelf().inSingletonScope();
  bind(PartyLobbyRuntimeRedirectResolver).toSelf().inSingletonScope();
  bind(ListPartiesUseCase).toSelf().inSingletonScope();
  bind(CreatePartyUseCase).toSelf().inSingletonScope();
  bind(PartyGameTypeRuntimeViewContributorToken).toService(PredictionPartyGameTypeRuntimeView);
  bind(PartyGameTypeRuntimeViewContributorToken).toService(QuizPartyGameTypeRuntimeView);

  bind<PartyHostControlPort>(PartyHostControlPortToken).toService(SocketIoPartyHostControlAdapter);
  bind<PartyHostRuntimeControlsPort>(PartyHostRuntimeControlsPortToken).toService(
    HostPartyRuntimeControlsResolver,
  );
  bind<PartyGuestSessionPort>(PartyGuestSessionPortToken).toService(
    PersistedPartyGuestSessionAdapter,
  );
  bind<GuestUsernameGeneratorPort>(GuestUsernameGeneratorPortToken).toService(
    UniqueUsernameGuestUsernameGeneratorAdapter,
  );
  bind<PrivatePartyPasswordGeneratorPort>(PrivatePartyPasswordGeneratorPortToken).toService(
    CryptoPrivatePartyPasswordGeneratorAdapter,
  );
  bind<PartyManagementPort>(PartyManagementPortToken).toService(GraphqlPartyManagementAdapter);
  bind<PartyPlayerPort>(PartyPlayerPortToken).toService(SocketIoPartyPlayerAdapter);
  bind<PartyObservationPort>(PartyObservationPortToken).toService(SocketIoPartyObservationAdapter);
  bind(AppProviderFactoryToken).toService(AppPartyProviderFactory);
  bind<RouteFactory>(ROUTE_FACTORY).toService(PartyRoutesFactory);
});

import { inject, injectable } from 'inversify';
import { PartyRouteService } from '../../../../../application/game/party/shared/services/party-route.service';
import type {
  PresentationRouteObject,
  RouteFactory,
} from '../../../../../application/shared/contracts/routing.port';
import { PatienceRouteProvider } from '../../../../shared/ui/patience';
import { PartyLobbyScreen } from '../screens/party-lobby-screen';
import { PartyLobbyRouteKind, PartyScreenSection } from '../screens/use-party-lobby-screen-state';

@injectable()
export class PartyRoutesFactory implements RouteFactory {
  constructor(
    @inject(PartyRouteService)
    private readonly partyRouteService: PartyRouteService,
  ) {}

  create(): PresentationRouteObject[] {
    return [
      {
        path: this.partyRouteService.resolvePartyJourneyRoutePattern(),
        element: (
          <PatienceRouteProvider>
            <PartyLobbyScreen
              routeKind={PartyLobbyRouteKind.PARTY_ID}
              normalizePartyId={(partyId) => this.partyRouteService.normalizePartyId(partyId)}
              resolvePartyLobbyRoute={(partyId) =>
                this.partyRouteService.resolvePartyLobbyRoute(partyId)
              }
              resolvePartyLeaderboardRoute={(partyId) =>
                this.partyRouteService.resolvePartyLeaderboardRoute(partyId)
              }
              resolvePartyResultRoute={(partyId, stageId) =>
                this.partyRouteService.resolvePartyResultRoute(partyId, stageId)
              }
              resolvePartyStageRoute={(partyId, stageId) =>
                this.partyRouteService.resolvePartyStageRoute(partyId, stageId)
              }
              resolveJoinPartyRoute={(pin) => this.partyRouteService.resolveJoinPartyRoute(pin)}
              resolvePartyAbsoluteUrl={(pin) =>
                this.partyRouteService.resolveJoinPartyAbsoluteUrl(pin)
              }
            />
          </PatienceRouteProvider>
        ),
      },
      {
        path: this.partyRouteService.resolveJoinPartyRoutePattern(),
        element: (
          <PatienceRouteProvider>
            <PartyLobbyScreen
              routeKind={PartyLobbyRouteKind.PIN}
              screenSection={PartyScreenSection.LOBBY}
              normalizePin={(pin) => this.partyRouteService.normalizePin(pin)}
              resolvePartyLobbyRoute={(partyId) =>
                this.partyRouteService.resolvePartyLobbyRoute(partyId)
              }
              resolvePartyLeaderboardRoute={(partyId) =>
                this.partyRouteService.resolvePartyLeaderboardRoute(partyId)
              }
              resolvePartyResultRoute={(partyId, stageId) =>
                this.partyRouteService.resolvePartyResultRoute(partyId, stageId)
              }
              resolvePartyStageRoute={(partyId, stageId) =>
                this.partyRouteService.resolvePartyStageRoute(partyId, stageId)
              }
              resolveJoinPartyRoute={(pin) => this.partyRouteService.resolveJoinPartyRoute(pin)}
              resolvePartyAbsoluteUrl={(pin) =>
                this.partyRouteService.resolveJoinPartyAbsoluteUrl(pin)
              }
            />
          </PatienceRouteProvider>
        ),
      },
    ];
  }
}

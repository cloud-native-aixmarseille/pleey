import { injectable } from 'inversify';
import { PartyRuntimeNoticeKind } from '../../../../../../domains/game/party/shared/ports/party-observation.port';

@injectable()
export class PlayerRuntimeNoticeMessageResolver {
  resolve(kind: PartyRuntimeNoticeKind): string {
    switch (kind) {
      case PartyRuntimeNoticeKind.RestartStage:
        return 'game.party.player.route.runtimeRestartStageToast';
      case PartyRuntimeNoticeKind.RewindParty:
        return 'game.party.player.route.runtimeRewindPartyToast';
      case PartyRuntimeNoticeKind.RewindStage:
        return 'game.party.player.route.runtimeRewindStageToast';
    }
  }
}

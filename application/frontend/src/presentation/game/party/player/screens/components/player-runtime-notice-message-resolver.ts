import { PartyRuntimeNoticeKind } from '../../../../../../domains/game/party/shared/ports/party-observation.port';

export class PlayerRuntimeNoticeMessageResolver {
  static resolve(kind: PartyRuntimeNoticeKind): string {
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

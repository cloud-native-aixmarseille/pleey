import { injectable } from 'inversify';
import { createElement } from 'react';
import { GameType } from '../../../../../domains/game/types/shared/game-type';
import type { PartyGameTypeRuntimeView } from '../../../../../presentation/game/party/shared/contexts/party-game-type-runtime-registry-context';
import { PredictionHostResultPanel } from '../../../../../presentation/game/types/prediction/screens/live/components/prediction-host-result-panel';
import { PredictionHostStagePanel } from '../../../../../presentation/game/types/prediction/screens/live/components/prediction-host-stage-panel';
import { PredictionPlayerResultSurface } from '../../../../../presentation/game/types/prediction/screens/live/components/prediction-player-result-surface';
import { PredictionPlayerStageSurface } from '../../../../../presentation/game/types/prediction/screens/live/components/prediction-player-stage-surface';
import type { PartyGameTypeRuntimeViewContributor } from '../contracts/party-game-type-runtime-view-contributor';

type HostRuntimePanelProps = Parameters<PartyGameTypeRuntimeView['renderHostResultPanel']>[0];
type PlayerResultSurfaceProps = Parameters<
  PartyGameTypeRuntimeView['renderPlayerResultSurface']
>[0];
type PlayerStageSurfaceProps = Parameters<PartyGameTypeRuntimeView['renderPlayerStageSurface']>[0];

@injectable()
export class PredictionPartyGameTypeRuntimeView implements PartyGameTypeRuntimeViewContributor {
  readonly gameType = GameType.Prediction;

  renderHostResultPanel({ party }: HostRuntimePanelProps) {
    return createElement(PredictionHostResultPanel, { party });
  }

  renderHostStagePanel({ party }: HostRuntimePanelProps) {
    return createElement(PredictionHostStagePanel, { party });
  }

  renderPlayerResultSurface(props: PlayerResultSurfaceProps) {
    return createElement(PredictionPlayerResultSurface, props);
  }

  renderPlayerStageSurface(props: PlayerStageSurfaceProps) {
    return createElement(PredictionPlayerStageSurface, props);
  }
}

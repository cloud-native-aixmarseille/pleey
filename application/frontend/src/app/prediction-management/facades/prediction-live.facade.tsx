import { injectable } from 'inversify';
import type { ReactNode } from 'react';
import type {
  GameTypeLiveFacade,
  HostResultViewProps,
  HostStageViewProps,
  PlayerResultViewProps,
  PlayerStageViewProps,
} from '../../../application/game-catalog/contracts/live-game-type-facade';
import { PredictionHostResultView } from '../../../presentation/prediction/screens/live/components/prediction-host-result-view';
import { PredictionHostStageView } from '../../../presentation/prediction/screens/live/components/prediction-host-stage-view';
import { PredictionPlayerResultView } from '../../../presentation/prediction/screens/live/components/prediction-player-result-view';
import { PredictionPlayerStageView } from '../../../presentation/prediction/screens/live/components/prediction-player-stage-view';

@injectable()
export class PredictionLiveFacade implements GameTypeLiveFacade {
  readonly gameTypeKey = 'prediction';
  readonly titleKey = 'prediction.gameType.title';

  renderHostStageView(props: HostStageViewProps): ReactNode {
    return <PredictionHostStageView {...props} />;
  }

  renderPlayerStageView(props: PlayerStageViewProps): ReactNode {
    return <PredictionPlayerStageView {...props} />;
  }

  renderHostResultView(props: HostResultViewProps): ReactNode {
    return <PredictionHostResultView {...props} />;
  }

  renderPlayerResultView(props: PlayerResultViewProps): ReactNode {
    return <PredictionPlayerResultView {...props} />;
  }
}

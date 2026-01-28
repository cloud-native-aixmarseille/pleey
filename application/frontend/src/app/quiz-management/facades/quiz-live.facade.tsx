import { injectable } from 'inversify';
import type { ReactNode } from 'react';
import type {
  GameTypeLiveFacade,
  HostResultViewProps,
  HostStageViewProps,
  PlayerResultViewProps,
  PlayerStageViewProps,
} from '../../../application/game-catalog/contracts/live-game-type-facade';
import { QuizHostResultView } from '../../../presentation/quiz/screens/live/components/quiz-host-result-view';
import { QuizHostStageView } from '../../../presentation/quiz/screens/live/components/quiz-host-stage-view';
import { QuizPlayerResultView } from '../../../presentation/quiz/screens/live/components/quiz-player-result-view';
import { QuizPlayerStageView } from '../../../presentation/quiz/screens/live/components/quiz-player-stage-view';

@injectable()
export class QuizLiveFacade implements GameTypeLiveFacade {
  readonly gameTypeKey = 'quiz';
  readonly titleKey = 'quiz.gameType.title';

  renderHostStageView(props: HostStageViewProps): ReactNode {
    return <QuizHostStageView {...props} />;
  }

  renderPlayerStageView(props: PlayerStageViewProps): ReactNode {
    return <QuizPlayerStageView {...props} />;
  }

  renderHostResultView(props: HostResultViewProps): ReactNode {
    return <QuizHostResultView {...props} />;
  }

  renderPlayerResultView(props: PlayerResultViewProps): ReactNode {
    return <QuizPlayerResultView {...props} />;
  }
}

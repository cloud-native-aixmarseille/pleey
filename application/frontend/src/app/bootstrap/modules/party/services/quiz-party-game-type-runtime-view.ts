import { injectable } from 'inversify';
import { createElement } from 'react';
import { GameType } from '../../../../../domains/game/types/shared/game-type';
import type { PartyGameTypeRuntimeView } from '../../../../../presentation/game/party/shared/contexts/party-game-type-runtime-registry-context';
import { QuizHostResultPanel } from '../../../../../presentation/game/types/quiz/screens/live/components/quiz-host-result-panel';
import { QuizHostStagePanel } from '../../../../../presentation/game/types/quiz/screens/live/components/quiz-host-stage-panel';
import { QuizPlayerResultSurface } from '../../../../../presentation/game/types/quiz/screens/live/components/quiz-player-result-surface';
import { QuizPlayerStageSurface } from '../../../../../presentation/game/types/quiz/screens/live/components/quiz-player-stage-surface';
import type { PartyGameTypeRuntimeViewContributor } from '../contracts/party-game-type-runtime-view-contributor';

type HostRuntimePanelProps = Parameters<PartyGameTypeRuntimeView['renderHostResultPanel']>[0];
type PlayerResultSurfaceProps = Parameters<
  PartyGameTypeRuntimeView['renderPlayerResultSurface']
>[0];
type PlayerStageSurfaceProps = Parameters<PartyGameTypeRuntimeView['renderPlayerStageSurface']>[0];

@injectable()
export class QuizPartyGameTypeRuntimeView implements PartyGameTypeRuntimeViewContributor {
  readonly gameType = GameType.Quiz;

  renderHostResultPanel({ party }: HostRuntimePanelProps) {
    return createElement(QuizHostResultPanel, { party });
  }

  renderHostStagePanel({ party }: HostRuntimePanelProps) {
    return createElement(QuizHostStagePanel, { party });
  }

  renderPlayerResultSurface(props: PlayerResultSurfaceProps) {
    return createElement(QuizPlayerResultSurface, props);
  }

  renderPlayerStageSurface(props: PlayerStageSurfaceProps) {
    return createElement(QuizPlayerStageSurface, props);
  }
}

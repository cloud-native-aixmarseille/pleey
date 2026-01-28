import type { ReactNode } from 'react';
import type { ActionResult } from '../../../domains/game-session/entities/action-result';
import type { GameStage } from '../../../domains/game-session/entities/game-stage';
import type { ResolvedStageAction } from '../../game-session/live/shared/contracts/resolved-stage-action';
import type { StageResultDistributionItem } from '../../game-session/live/shared/contracts/stage-result-distribution-item';

export interface HostStageViewProps {
  readonly stage: GameStage;
  readonly resolvedActions: readonly ResolvedStageAction[];
  readonly stagePosition: number;
  readonly totalStages: number;
  readonly timeLeft: number | null;
  readonly isPaused: boolean;
}

export interface PlayerStageViewProps {
  readonly stage: GameStage;
  readonly resolvedActions: readonly ResolvedStageAction[];
  readonly actionSubmitted: boolean;
  readonly isPaused: boolean;
  readonly timeLeft: number | null;
  readonly onSubmitAction: (actionId: number) => void;
}

export interface HostResultViewProps {
  readonly stage: GameStage;
  readonly actionResult: ActionResult;
  readonly resultDistribution: readonly StageResultDistributionItem[];
  readonly stagePosition: number;
  readonly totalStages: number;
}

export interface PlayerResultViewProps {
  readonly actionResult: ActionResult;
  readonly resultDistribution: readonly StageResultDistributionItem[];
}

export interface GameTypeLiveFacade {
  readonly gameTypeKey: string;
  readonly titleKey: string;
  renderHostStageView(props: HostStageViewProps): ReactNode;
  renderPlayerStageView(props: PlayerStageViewProps): ReactNode;
  renderHostResultView(props: HostResultViewProps): ReactNode;
  renderPlayerResultView(props: PlayerResultViewProps): ReactNode;
}

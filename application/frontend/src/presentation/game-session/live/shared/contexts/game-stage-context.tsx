import { createContext, type PropsWithChildren, useContext } from 'react';
import type { ResolvedStageAction } from '../../../../../application/game-session/live/shared/contracts/resolved-stage-action';
import type { StageResultDistributionItem } from '../../../../../application/game-session/live/shared/contracts/stage-result-distribution-item';
import type { ActionResult } from '../../../../../domains/game-session/entities/action-result';
import type { GameStage } from '../../../../../domains/game-session/entities/game-stage';
import { PresentationContextErrorCode } from '../../../../../domains/shared/errors/presentation-context-error-code';

interface StageActionChoicesPort {
  execute(command: {
    readonly selectedActionId: number | null;
    readonly stage: GameStage;
  }): readonly ResolvedStageAction[];
}

interface StageActionDistributionPort {
  execute(command: {
    readonly actionResult: ActionResult;
    readonly selectedActionId: number | null;
    readonly stage: GameStage;
  }): readonly StageResultDistributionItem[];
}

export interface GameStageContextValue {
  readonly stageActionChoices: StageActionChoicesPort;
  readonly stageActionDistribution: StageActionDistributionPort;
}

const GameStageContext = createContext<GameStageContextValue | null>(null);

interface GameStageProviderProps extends PropsWithChildren {
  readonly value: GameStageContextValue;
}

export function GameStageProvider({ children, value }: GameStageProviderProps) {
  return <GameStageContext.Provider value={value}>{children}</GameStageContext.Provider>;
}

export function useGameStage(): GameStageContextValue {
  const value = useContext(GameStageContext);

  if (!value) {
    throw new Error(PresentationContextErrorCode.GAME_PROVIDER_REQUIRED);
  }

  return value;
}

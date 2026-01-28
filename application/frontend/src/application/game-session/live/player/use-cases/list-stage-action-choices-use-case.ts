import { injectable } from 'inversify';
import type { GameStage } from '../../../../../domains/game-session/entities/game-stage';

export type { ResolvedStageAction } from '../../shared/contracts/resolved-stage-action';

import type { ResolvedStageAction } from '../../shared/contracts/resolved-stage-action';

interface ListStageActionChoicesCommand {
  readonly selectedActionId: number | null;
  readonly stage: GameStage;
}

@injectable()
export class ListStageActionChoicesUseCase {
  execute(command: ListStageActionChoicesCommand): readonly ResolvedStageAction[] {
    return [...command.stage.actions]
      .sort((left, right) => left.position - right.position)
      .map((action) => ({
        id: action.id,
        text: action.text,
        isSelected: command.selectedActionId === action.id,
      }));
  }
}

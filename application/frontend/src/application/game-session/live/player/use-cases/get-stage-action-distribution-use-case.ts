import { inject, injectable } from 'inversify';
import type { ActionResult } from '../../../../../domains/game-session/entities/action-result';
import type { GameStage } from '../../../../../domains/game-session/entities/game-stage';

export type { StageResultDistributionItem } from '../../shared/contracts/stage-result-distribution-item';

import type { StageResultDistributionItem } from '../../shared/contracts/stage-result-distribution-item';
import { ListStageActionChoicesUseCase } from './list-stage-action-choices-use-case';

interface GetStageActionDistributionCommand {
  readonly actionResult: ActionResult;
  readonly selectedActionId: number | null;
  readonly stage: GameStage;
}

@injectable()
export class GetStageActionDistributionUseCase {
  constructor(
    @inject(ListStageActionChoicesUseCase)
    private readonly listStageActionChoicesUseCase: ListStageActionChoicesUseCase,
  ) {}

  execute(command: GetStageActionDistributionCommand): readonly StageResultDistributionItem[] {
    const totalActions = command.actionResult.statistics?.totalActions ?? 0;

    return this.listStageActionChoicesUseCase.execute(command).map((action) => {
      const actionCount = command.actionResult.statistics?.actionDistribution[action.id] ?? 0;

      return {
        id: action.id,
        text: action.text,
        isCorrect: command.actionResult.correctActionIds.includes(action.id),
        isSelected: action.isSelected,
        actionCount,
        actionPercent: totalActions > 0 ? Math.round((actionCount / totalActions) * 100) : 0,
      } satisfies StageResultDistributionItem;
    });
  }
}

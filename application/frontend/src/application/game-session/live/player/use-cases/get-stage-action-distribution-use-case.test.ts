import { describe, expect, it } from 'vitest';
import { GetStageActionDistributionUseCase } from './get-stage-action-distribution-use-case';
import { ListStageActionChoicesUseCase } from './list-stage-action-choices-use-case';

describe('GetStageActionDistributionUseCase', () => {
  it('maps the result payload to neutral distribution items', () => {
    const useCase = new GetStageActionDistributionUseCase(new ListStageActionChoicesUseCase());

    const result = useCase.execute({
      actionResult: {
        isCorrect: true,
        points: 100,
        correctActionIds: [1],
        statistics: {
          totalActions: 4,
          actionDistribution: {
            1: 3,
            2: 1,
          },
        },
      },
      selectedActionId: 2,
      stage: {
        id: 1,
        sourceId: 9,
        position: 0,
        text: 'Question',
        type: 'multiple',
        actions: [
          { id: 1, position: 0, text: 'A', isCorrect: true },
          { id: 2, position: 1, text: 'B', isCorrect: false },
        ],
        timeLimit: 20,
        points: 100,
      },
    });

    expect(result).toEqual([
      {
        id: 1,
        text: 'A',
        isCorrect: true,
        isSelected: false,
        actionCount: 3,
        actionPercent: 75,
      },
      {
        id: 2,
        text: 'B',
        isCorrect: false,
        isSelected: true,
        actionCount: 1,
        actionPercent: 25,
      },
    ]);
  });
});

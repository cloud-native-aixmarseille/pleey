import { describe, expect, it } from 'vitest';
import { ListStageActionChoicesUseCase } from './list-stage-action-choices-use-case';

describe('ListStageActionChoicesUseCase', () => {
  it('sorts actions by position and marks the selected choice', () => {
    const useCase = new ListStageActionChoicesUseCase();

    const result = useCase.execute({
      selectedActionId: 2,
      stage: {
        id: 1,
        sourceId: 9,
        position: 0,
        text: 'Question',
        type: 'multiple',
        actions: [
          { id: 2, position: 1, text: 'B', isCorrect: false },
          { id: 1, position: 0, text: 'A', isCorrect: true },
        ],
        timeLimit: 20,
        points: 100,
      },
    });

    expect(result).toEqual([
      { id: 1, text: 'A', isSelected: false },
      { id: 2, text: 'B', isSelected: true },
    ]);
  });
});

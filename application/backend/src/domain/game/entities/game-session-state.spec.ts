import { describe, expect, it } from 'vitest';
import { GameSessionState } from './game-session-state';
import { GameAction, GameStage } from './game-stage';

function createStage(id: number, position: number) {
  return new GameStage(
    id,
    10,
    position,
    `Stage ${position}`,
    'multiple',
    [new GameAction(id * 10, id, `Action ${position}`, 1, true)],
    20,
    100,
  );
}

describe('GameSessionState', () => {
  it('advances and rewinds using stage position instead of array order', () => {
    const state = GameSessionState.create({
      sessionId: 1,
      gameId: 99,
      gameTitle: 'Arcade Trivia',
      gameType: 'quiz',
      hostId: 7,
      stages: [createStage(300, 3), createStage(100, 1), createStage(200, 2)],
      currentStageId: 100,
    });

    expect(state.hasMoreStages).toBe(true);
    expect(state.canRewindStage).toBe(true);

    state.advanceToNextStage();
    expect(state.currentStageId).toBe(200);

    state.advanceToNextStage();
    expect(state.currentStageId).toBe(300);
    expect(state.hasMoreStages).toBe(false);

    state.rewindToPreviousStage();
    expect(state.currentStageId).toBe(200);

    state.rewindToPreviousStage();
    expect(state.currentStageId).toBe(100);

    state.rewindToPreviousStage();
    expect(state.currentStageId).toBeNull();
  });

  it('starts from the lowest stage position when no stage is active', () => {
    const state = GameSessionState.create({
      sessionId: 1,
      gameId: 99,
      gameTitle: 'Arcade Trivia',
      gameType: 'quiz',
      hostId: 7,
      stages: [createStage(300, 3), createStage(100, 1), createStage(200, 2)],
      currentStageId: null,
    });

    state.advanceToNextStage();

    expect(state.currentStageId).toBe(100);
  });
});

import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import type { QuizManagementRepository } from '../../../../../domains/game/types/quiz/ports/quiz-management.repository';
import { PlayableManagementFixtureFactory } from '../../../../../test-utils/fixtures/playable-management-fixture-factory';
import { ProjectIdentifier } from '../../../../workspace/shared/services/identifiers/project-identifier';
import { GameTypeIdentifier } from '../../shared/services/game-type-identifier';
import { QuizQuestionIdentifier } from '../services/quiz-question-identifier';
import { QuizManagementFacade } from './quiz-management.facade';

const gameTypeIdentifier = new GameTypeIdentifier();
const playableManagementFixtureFactory = new PlayableManagementFixtureFactory();
const projectIdentifier = new ProjectIdentifier();
const quizQuestionIdentifier = new QuizQuestionIdentifier();

describe('QuizManagementFacade', () => {
  it('adapts shared management gateway calls to quiz repository methods', async () => {
    const itemInput = playableManagementFixtureFactory.createItemInput({
      kind: 'multiple' as const,
    });
    const savedItem = playableManagementFixtureFactory.createItem({
      id: quizQuestionIdentifier.parse(33),
      gameTypeId: gameTypeIdentifier.parse(9),
      kind: 'multiple' as const,
      options: itemInput.options,
    });
    const repository: QuizManagementRepository = {
      createQuiz: vi.fn().mockResolvedValue(gameTypeIdentifier.parse(9)),
      load: vi.fn().mockResolvedValue({ game: {}, items: [] }),
      updateMetadata: vi.fn().mockResolvedValue(undefined),
      deleteQuiz: vi.fn().mockResolvedValue(undefined),
      createQuestion: vi.fn().mockResolvedValue(savedItem),
      importQuestions: vi.fn().mockResolvedValue({ importedCount: 2 }),
      updateQuestion: vi.fn().mockResolvedValue(savedItem),
      deleteQuestion: vi.fn().mockResolvedValue(undefined),
    } as never;
    const facade = new QuizManagementFacade(repository);

    const createdGameId = await facade.createGame(projectIdentifier.parse(9), {
      title: 'Quiz',
      description: null,
    });
    await facade.updateMetadata(gameTypeIdentifier.parse(9), {
      title: 'Updated',
      description: null,
    });
    await facade.deleteGame(gameTypeIdentifier.parse(9));
    const createdItem = await facade.createItem(gameTypeIdentifier.parse(9), itemInput);
    const questionId = quizQuestionIdentifier.parse(33);
    const updatedItem = await facade.updateItem(questionId, itemInput);
    await facade.deleteItem(questionId);
    const importResult = await facade.importContent(gameTypeIdentifier.parse(9), {
      content: '[]',
      fileName: 'quiz-import.json',
    });

    expect(repository.createQuiz).toHaveBeenCalledWith(projectIdentifier.parse(9), {
      title: 'Quiz',
      description: null,
    });
    expect(repository.updateMetadata).toHaveBeenCalledWith(gameTypeIdentifier.parse(9), {
      title: 'Updated',
      description: null,
    });
    expect(repository.deleteQuiz).toHaveBeenCalledWith(gameTypeIdentifier.parse(9));
    expect(repository.createQuestion).toHaveBeenCalledWith(gameTypeIdentifier.parse(9), itemInput);
    expect(repository.importQuestions).toHaveBeenCalledWith(gameTypeIdentifier.parse(9), {
      content: '[]',
      fileName: 'quiz-import.json',
    });
    expect(repository.updateQuestion).toHaveBeenCalledWith(questionId, itemInput);
    expect(repository.deleteQuestion).toHaveBeenCalledWith(questionId);
    expect(createdGameId).toBe(9);
    expect(createdItem).toBe(savedItem);
    expect(importResult).toEqual({ importedCount: 2 });
    expect(updatedItem).toBe(savedItem);
  });
});

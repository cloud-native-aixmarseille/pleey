import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import type { QuizManagementRepository } from '../../../../../domains/game/types/quiz/ports/quiz-management.repository';
import { PlayableManagementFixtureFactory } from '../../../../../test-utils/fixtures/playable-management-fixture-factory';
import { coerceUuidV7TestValue } from '../../../../../test-utils/fixtures/uuid-v7-test-value';
import { GameTypeIdentifierMockFactory } from '../../../../../test-utils/mocks/game-type-identifier-mock-factory';
import { ProjectIdentifierMockFactory } from '../../../../../test-utils/mocks/project-identifier-mock-factory';
import { QuizQuestionIdentifier } from '../services/quiz-question-identifier';
import { QuizManagementFacade } from './quiz-management.facade';

const gameTypeIdentifier = new GameTypeIdentifierMockFactory().create();
const playableManagementFixtureFactory = new PlayableManagementFixtureFactory();
const projectIdentifier = new ProjectIdentifierMockFactory().create();
const quizQuestionIdentifier = new QuizQuestionIdentifier();
const parseQuestionId = (value: number) =>
  quizQuestionIdentifier.parse(coerceUuidV7TestValue(value));

describe('QuizManagementFacade', () => {
  it('adapts shared management gateway calls to quiz repository methods', async () => {
    const itemInput = playableManagementFixtureFactory.createItemInput({
      kind: 'multiple' as const,
    });
    const gameTypeId = gameTypeIdentifier.parse(9);
    const projectId = projectIdentifier.parse(9);
    const questionId = parseQuestionId(33);
    const savedItem = playableManagementFixtureFactory.createItem({
      id: questionId,
      gameTypeId,
      kind: 'multiple' as const,
      options: itemInput.options,
    });
    const repository: QuizManagementRepository = {
      createQuiz: vi.fn().mockResolvedValue(gameTypeId),
      createQuizFromImport: vi.fn().mockResolvedValue({
        gameTypeId,
        importedCount: 2,
      }),
      load: vi.fn().mockResolvedValue({ game: {}, items: [] }),
      updateMetadata: vi.fn().mockResolvedValue(undefined),
      deleteQuiz: vi.fn().mockResolvedValue(undefined),
      createQuestion: vi.fn().mockResolvedValue(savedItem),
      updateQuestion: vi.fn().mockResolvedValue(savedItem),
      deleteQuestion: vi.fn().mockResolvedValue(undefined),
    } as never;
    const facade = new QuizManagementFacade(repository);

    const createdGameId = await facade.createGame(projectId, {
      title: 'Quiz',
      description: null,
    });
    const importFile = new File(['[]'], 'quiz-import.json', { type: 'application/json' });
    const createdFromImport = await facade.createGameFromImport(projectId, {
      title: 'Imported quiz',
      description: null,
      file: importFile,
    });
    await facade.updateMetadata(gameTypeId, {
      title: 'Updated',
      description: null,
    });
    await facade.deleteGame(gameTypeId);
    const createdItem = await facade.createItem(gameTypeId, itemInput);
    const updatedItem = await facade.updateItem(questionId, itemInput);
    await facade.deleteItem(questionId);

    expect(repository.createQuiz).toHaveBeenCalledWith(projectId, {
      title: 'Quiz',
      description: null,
    });
    expect(repository.createQuizFromImport).toHaveBeenCalledWith(projectId, {
      title: 'Imported quiz',
      description: null,
      file: importFile,
    });
    expect(repository.updateMetadata).toHaveBeenCalledWith(gameTypeId, {
      title: 'Updated',
      description: null,
    });
    expect(repository.deleteQuiz).toHaveBeenCalledWith(gameTypeId);
    expect(repository.createQuestion).toHaveBeenCalledWith(gameTypeId, itemInput);
    expect(repository.updateQuestion).toHaveBeenCalledWith(questionId, itemInput);
    expect(repository.deleteQuestion).toHaveBeenCalledWith(questionId);
    expect(createdGameId).toBe(gameTypeId);
    expect(createdFromImport).toEqual({
      gameTypeId,
      importedCount: 2,
    });
    expect(createdItem).toBe(savedItem);
    expect(updatedItem).toBe(savedItem);
  });
});

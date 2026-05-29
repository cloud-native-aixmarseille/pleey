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
      createQuizFromImport: vi.fn().mockResolvedValue({
        gameTypeId: gameTypeIdentifier.parse(9),
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

    const createdGameId = await facade.createGame(projectIdentifier.parse(9), {
      title: 'Quiz',
      description: null,
    });
    const importFile = new File(['[]'], 'quiz-import.json', { type: 'application/json' });
    const createdFromImport = await facade.createGameFromImport(projectIdentifier.parse(9), {
      title: 'Imported quiz',
      description: null,
      file: importFile,
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

    expect(repository.createQuiz).toHaveBeenCalledWith(projectIdentifier.parse(9), {
      title: 'Quiz',
      description: null,
    });
    expect(repository.createQuizFromImport).toHaveBeenCalledWith(projectIdentifier.parse(9), {
      title: 'Imported quiz',
      description: null,
      file: importFile,
    });
    expect(repository.updateMetadata).toHaveBeenCalledWith(gameTypeIdentifier.parse(9), {
      title: 'Updated',
      description: null,
    });
    expect(repository.deleteQuiz).toHaveBeenCalledWith(gameTypeIdentifier.parse(9));
    expect(repository.createQuestion).toHaveBeenCalledWith(gameTypeIdentifier.parse(9), itemInput);
    expect(repository.updateQuestion).toHaveBeenCalledWith(questionId, itemInput);
    expect(repository.deleteQuestion).toHaveBeenCalledWith(questionId);
    expect(createdGameId).toBe(9);
    expect(createdFromImport).toEqual({
      gameTypeId: gameTypeIdentifier.parse(9),
      importedCount: 2,
    });
    expect(createdItem).toBe(savedItem);
    expect(updatedItem).toBe(savedItem);
  });
});

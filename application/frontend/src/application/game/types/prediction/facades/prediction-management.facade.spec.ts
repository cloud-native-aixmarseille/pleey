import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import type { PredictionManagementRepository } from '../../../../../domains/game/types/prediction/ports/prediction-management.repository';
import { PlayableManagementFixtureFactory } from '../../../../../test-utils/fixtures/playable-management-fixture-factory';
import { coerceUuidV7TestValue } from '../../../../../test-utils/fixtures/uuid-v7-test-value';
import { GameTypeIdentifierMockFactory } from '../../../../../test-utils/mocks/game-type-identifier-mock-factory';
import { ProjectIdentifierMockFactory } from '../../../../../test-utils/mocks/project-identifier-mock-factory';
import { PredictionPromptIdentifier } from '../services/prediction-prompt-identifier';
import { PredictionManagementFacade } from './prediction-management.facade';

const gameTypeIdentifier = new GameTypeIdentifierMockFactory().create();
const playableManagementFixtureFactory = new PlayableManagementFixtureFactory();
const projectIdentifier = new ProjectIdentifierMockFactory().create();
const predictionPromptIdentifier = new PredictionPromptIdentifier();
const parsePromptId = (value: number) =>
  predictionPromptIdentifier.parse(coerceUuidV7TestValue(value));

describe('PredictionManagementFacade', () => {
  it('adapts shared management gateway calls to prediction repository methods', async () => {
    const itemInput = playableManagementFixtureFactory.createItemInput({
      options: [playableManagementFixtureFactory.createOption({ text: 'Home' })],
      points: 250,
      text: 'Who wins?',
      timeLimit: 30,
    });
    const gameTypeId = gameTypeIdentifier.parse(12);
    const projectId = projectIdentifier.parse(12);
    const promptId = parsePromptId(44);
    const savedItem = playableManagementFixtureFactory.createItem({
      id: promptId,
      gameTypeId,
      options: itemInput.options,
      points: 250,
      text: 'Who wins?',
      timeLimit: 30,
    });
    const repository: PredictionManagementRepository = {
      createPrediction: vi.fn().mockResolvedValue(gameTypeId),
      createPredictionFromImport: vi.fn().mockResolvedValue({
        gameTypeId,
        importedCount: 3,
      }),
      load: vi.fn().mockResolvedValue({ game: {}, items: [] }),
      updateMetadata: vi.fn().mockResolvedValue(undefined),
      deletePrediction: vi.fn().mockResolvedValue(undefined),
      createPrompt: vi.fn().mockResolvedValue(savedItem),
      updatePrompt: vi.fn().mockResolvedValue(savedItem),
      deletePrompt: vi.fn().mockResolvedValue(undefined),
    } as never;
    const facade = new PredictionManagementFacade(repository);

    const createdGameId = await facade.createGame(projectId, {
      title: 'Prediction',
      description: null,
    });
    const importFile = new File(['[]'], 'prediction-import.json', { type: 'application/json' });
    const createdFromImport = await facade.createGameFromImport(projectId, {
      title: 'Imported prediction',
      description: null,
      file: importFile,
    });
    await facade.updateMetadata(gameTypeId, {
      title: 'Updated',
      description: null,
    });
    await facade.deleteGame(gameTypeId);
    const createdItem = await facade.createItem(gameTypeId, itemInput);
    const updatedItem = await facade.updateItem(promptId, itemInput);
    await facade.deleteItem(promptId);

    expect(repository.createPrediction).toHaveBeenCalledWith(projectId, {
      title: 'Prediction',
      description: null,
    });
    expect(repository.createPredictionFromImport).toHaveBeenCalledWith(projectId, {
      title: 'Imported prediction',
      description: null,
      file: importFile,
    });
    expect(repository.updateMetadata).toHaveBeenCalledWith(gameTypeId, {
      title: 'Updated',
      description: null,
    });
    expect(repository.deletePrediction).toHaveBeenCalledWith(gameTypeId);
    expect(repository.createPrompt).toHaveBeenCalledWith(gameTypeId, itemInput);
    expect(repository.updatePrompt).toHaveBeenCalledWith(promptId, itemInput);
    expect(repository.deletePrompt).toHaveBeenCalledWith(promptId);
    expect(createdGameId).toBe(gameTypeId);
    expect(createdFromImport).toEqual({
      gameTypeId,
      importedCount: 3,
    });
    expect(createdItem).toBe(savedItem);
    expect(updatedItem).toBe(savedItem);
  });
});

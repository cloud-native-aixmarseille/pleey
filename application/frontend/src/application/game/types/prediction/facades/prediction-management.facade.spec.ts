import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import type { PredictionManagementRepository } from '../../../../../domains/game/types/prediction/ports/prediction-management.repository';
import { PlayableManagementFixtureFactory } from '../../../../../test-utils/fixtures/playable-management-fixture-factory';
import { ProjectIdentifier } from '../../../../workspace/shared/services/identifiers/project-identifier';
import { GameTypeIdentifier } from '../../shared/services/game-type-identifier';
import { PredictionPromptIdentifier } from '../services/prediction-prompt-identifier';
import { PredictionManagementFacade } from './prediction-management.facade';

const gameTypeIdentifier = new GameTypeIdentifier();
const playableManagementFixtureFactory = new PlayableManagementFixtureFactory();
const projectIdentifier = new ProjectIdentifier();
const predictionPromptIdentifier = new PredictionPromptIdentifier();

describe('PredictionManagementFacade', () => {
  it('adapts shared management gateway calls to prediction repository methods', async () => {
    const itemInput = playableManagementFixtureFactory.createItemInput({
      options: [playableManagementFixtureFactory.createOption({ text: 'Home' })],
      points: 250,
      text: 'Who wins?',
      timeLimit: 30,
    });
    const savedItem = playableManagementFixtureFactory.createItem({
      id: predictionPromptIdentifier.parse(44),
      gameTypeId: gameTypeIdentifier.parse(12),
      options: itemInput.options,
      points: 250,
      text: 'Who wins?',
      timeLimit: 30,
    });
    const repository: PredictionManagementRepository = {
      createPrediction: vi.fn().mockResolvedValue(gameTypeIdentifier.parse(12)),
      createPredictionFromImport: vi.fn().mockResolvedValue({
        gameTypeId: gameTypeIdentifier.parse(12),
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

    const createdGameId = await facade.createGame(projectIdentifier.parse(12), {
      title: 'Prediction',
      description: null,
    });
    const importFile = new File(['[]'], 'prediction-import.json', { type: 'application/json' });
    const createdFromImport = await facade.createGameFromImport(projectIdentifier.parse(12), {
      title: 'Imported prediction',
      description: null,
      file: importFile,
    });
    await facade.updateMetadata(gameTypeIdentifier.parse(12), {
      title: 'Updated',
      description: null,
    });
    await facade.deleteGame(gameTypeIdentifier.parse(12));
    const createdItem = await facade.createItem(gameTypeIdentifier.parse(12), itemInput);
    const promptId = predictionPromptIdentifier.parse(44);
    const updatedItem = await facade.updateItem(promptId, itemInput);
    await facade.deleteItem(promptId);

    expect(repository.createPrediction).toHaveBeenCalledWith(projectIdentifier.parse(12), {
      title: 'Prediction',
      description: null,
    });
    expect(repository.createPredictionFromImport).toHaveBeenCalledWith(
      projectIdentifier.parse(12),
      {
        title: 'Imported prediction',
        description: null,
        file: importFile,
      },
    );
    expect(repository.updateMetadata).toHaveBeenCalledWith(gameTypeIdentifier.parse(12), {
      title: 'Updated',
      description: null,
    });
    expect(repository.deletePrediction).toHaveBeenCalledWith(gameTypeIdentifier.parse(12));
    expect(repository.createPrompt).toHaveBeenCalledWith(gameTypeIdentifier.parse(12), itemInput);
    expect(repository.updatePrompt).toHaveBeenCalledWith(promptId, itemInput);
    expect(repository.deletePrompt).toHaveBeenCalledWith(promptId);
    expect(createdGameId).toBe(12);
    expect(createdFromImport).toEqual({
      gameTypeId: gameTypeIdentifier.parse(12),
      importedCount: 3,
    });
    expect(createdItem).toBe(savedItem);
    expect(updatedItem).toBe(savedItem);
  });
});

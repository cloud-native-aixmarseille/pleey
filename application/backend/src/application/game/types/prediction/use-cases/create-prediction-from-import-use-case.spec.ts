import { describe, expect, it, vi } from 'vitest';
import { Prediction } from '../../../../../domain/game/types/prediction/entities/prediction';
import { PredictionErrorCode } from '../../../../../domain/game/types/prediction/enums/prediction-error-code.enum';
import type { PredictionManagementRepository } from '../../../../../domain/game/types/prediction/ports/prediction-management.repository';
import { ProjectIdentifier } from '../../../../workspace/shared/services/identifiers/project-identifier';
import { GameIdentifier } from '../../../shared/services/identifiers/game-identifier';
import { GameTypeIdentifier } from '../../shared/services/game-type-identifier';
import { PlayableContentImportSource } from '../../shared/services/playable-content-import/import-source';
import type { PredictionImportPromptMapper } from '../services/prediction-import-prompt-mapper';
import { CreatePredictionFromImportUseCase } from './create-prediction-from-import-use-case';

class TestPlayableContentImportSource extends PlayableContentImportSource {
  constructor(readonly fileName: string) {
    super();
  }

  async readAll(): Promise<string> {
    return 'unused';
  }

  async *readLines(): AsyncIterable<string> {
    yield* [];
  }
}

const gameIdentifier = new GameIdentifier();
const gameTypeIdentifier = new GameTypeIdentifier();
const projectIdentifier = new ProjectIdentifier();

describe('CreatePredictionFromImportUseCase', () => {
  it('creates a prediction and imported prompts through one repository command', async () => {
    const createdPrediction = new Prediction(
      gameTypeIdentifier.parse(13),
      gameIdentifier.parse(31),
      projectIdentifier.parse(7),
      'Sprint prediction',
      null,
      new Date('2026-06-01T10:00:00.000Z'),
      1,
    );
    const predictionRepository = {
      createWithPrompts: vi.fn().mockResolvedValue(createdPrediction),
    } as unknown as PredictionManagementRepository;
    const accessGuard = {
      assertCanManageProject: vi.fn().mockResolvedValue(undefined),
    };
    const importPromptMapper = {
      map: vi.fn().mockResolvedValue([
        {
          options: [
            { id: null, isCorrect: true, position: 0, text: 'Home' },
            { id: null, isCorrect: false, position: 1, text: 'Away' },
          ],
          points: 250,
          promptText: 'Who wins?',
          timeLimit: 30,
        },
      ]),
    } as unknown as PredictionImportPromptMapper;
    const useCase = new CreatePredictionFromImportUseCase(
      predictionRepository,
      accessGuard as never,
      importPromptMapper,
    );
    const source = new TestPlayableContentImportSource('prediction-import.json');

    const prediction = await useCase.execute(
      {
        projectId: projectIdentifier.parse(7),
        title: 'Sprint prediction',
        description: null,
        source,
      },
      17 as never,
    );

    expect(accessGuard.assertCanManageProject).toHaveBeenCalledWith(projectIdentifier.parse(7), 17);
    expect(importPromptMapper.map).toHaveBeenCalledWith(source);
    expect(predictionRepository.createWithPrompts).toHaveBeenCalledWith({
      projectId: projectIdentifier.parse(7),
      title: 'Sprint prediction',
      description: null,
      prompts: [
        expect.objectContaining({
          points: 250,
          promptText: 'Who wins?',
          timeLimit: 30,
        }),
      ],
    });
    expect(prediction).toBe(createdPrediction);
  });

  it('does not create a prediction when import parsing fails', async () => {
    const predictionRepository = {
      createWithPrompts: vi.fn(),
    } as unknown as PredictionManagementRepository;
    const accessGuard = {
      assertCanManageProject: vi.fn().mockResolvedValue(undefined),
    };
    const importPromptMapper = {
      map: vi.fn().mockImplementation(async () => {
        throw new Error(PredictionErrorCode.PREDICTION_IMPORT_UNSUPPORTED_FORMAT);
      }),
    } as unknown as PredictionImportPromptMapper;
    const useCase = new CreatePredictionFromImportUseCase(
      predictionRepository,
      accessGuard as never,
      importPromptMapper,
    );

    await expect(
      useCase.execute(
        {
          projectId: projectIdentifier.parse(7),
          title: 'Sprint prediction',
          description: null,
          source: new TestPlayableContentImportSource('prediction-import.docx'),
        },
        17 as never,
      ),
    ).rejects.toThrow(PredictionErrorCode.PREDICTION_IMPORT_UNSUPPORTED_FORMAT);
    expect(predictionRepository.createWithPrompts).not.toHaveBeenCalled();
  });
});

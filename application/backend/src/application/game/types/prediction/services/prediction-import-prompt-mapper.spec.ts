import { describe, expect, it, vi } from 'vitest';
import { PredictionErrorCode } from '../../../../../domain/game/types/prediction/enums/prediction-error-code.enum';
import { SelectableOptionPolicy } from '../../../../../domain/game/types/shared/services/selectable-option-policy';
import { PlayableContentImportSource } from '../../shared/services/playable-content-import/import-source';
import {
  PlayableContentImportParser,
  PlayableContentImportParserErrorCode,
} from '../../shared/services/playable-content-import/playable-content-import-parser';
import { PredictionImportPromptMapper } from './prediction-import-prompt-mapper';

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

describe('PredictionImportPromptMapper', () => {
  it('maps parsed prediction import items to prompt mutation data', async () => {
    // Arrange
    const parser = {
      parse: vi.fn().mockResolvedValue([
        {
          kind: 'multiple',
          options: [
            { isCorrect: true, position: 0, text: 'Home' },
            { isCorrect: false, position: 1, text: 'Away' },
          ],
          points: 250,
          text: 'Who wins?',
          timeLimit: 30,
        },
      ]),
    } as unknown as PlayableContentImportParser;
    const mapper = new PredictionImportPromptMapper(parser, new SelectableOptionPolicy());

    // Act
    const prompts = await mapper.map(new TestPlayableContentImportSource('prediction-import.json'));

    // Assert
    expect(prompts).toEqual([
      {
        options: [
          { id: null, isCorrect: true, position: 0, text: 'Home' },
          { id: null, isCorrect: false, position: 1, text: 'Away' },
        ],
        points: 250,
        promptText: 'Who wins?',
        timeLimit: 30,
      },
    ]);
  });

  it('maps parser failures to prediction import error codes', async () => {
    // Arrange
    const parser = {
      parse: vi.fn().mockImplementation(async () => {
        throw new Error(PlayableContentImportParserErrorCode.UNSUPPORTED_FORMAT);
      }),
    } as unknown as PlayableContentImportParser;
    const mapper = new PredictionImportPromptMapper(parser, new SelectableOptionPolicy());

    // Act + Assert
    await expect(mapper.map(new TestPlayableContentImportSource('prediction-import.docx'))).rejects.toMatchObject({
      code: PredictionErrorCode.PREDICTION_IMPORT_UNSUPPORTED_FORMAT,
      context: {
        fileName: 'prediction-import.docx',
        parserErrorCode: PlayableContentImportParserErrorCode.UNSUPPORTED_FORMAT,
      },
      message: PredictionErrorCode.PREDICTION_IMPORT_UNSUPPORTED_FORMAT,
    });
  });
});

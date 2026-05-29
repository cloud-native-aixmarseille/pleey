import { describe, expect, it, vi } from 'vitest';
import { PredictionErrorCode } from '../../../../../domain/game/types/prediction/enums/prediction-error-code.enum';
import { SelectableOptionPolicy } from '../../../../../domain/game/types/shared/services/selectable-option-policy';
import { PlayableContentImportParser } from '../../shared/services/playable-content-import/import-parser';
import { PlayableContentImportSource } from '../../shared/services/playable-content-import/import-source';
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

    const prompts = await mapper.map(new TestPlayableContentImportSource('prediction-import.json'));

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
    const parser = {
      parse: vi.fn().mockImplementation(async () => {
        throw new Error('PLAYABLE_CONTENT_IMPORT_UNSUPPORTED_FORMAT');
      }),
    } as unknown as PlayableContentImportParser;
    const mapper = new PredictionImportPromptMapper(parser, new SelectableOptionPolicy());

    await expect(
      mapper.map(new TestPlayableContentImportSource('prediction-import.docx')),
    ).rejects.toThrow(PredictionErrorCode.PREDICTION_IMPORT_UNSUPPORTED_FORMAT);
  });
});

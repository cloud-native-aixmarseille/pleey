import { describe, expect, it, vi } from 'vitest';
import { QuizQuestionType } from '../../../../../domain/game/types/quiz/entities/quiz-question';
import { QuizErrorCode } from '../../../../../domain/game/types/quiz/enums/quiz-error-code.enum';
import { SelectableOptionPolicy } from '../../../../../domain/game/types/shared/services/selectable-option-policy';
import { PlayableContentImportSource } from '../../shared/services/playable-content-import/import-source';
import { PlayableContentImportParser } from '../../shared/services/playable-content-import/playable-content-import-parser';
import { QuizImportQuestionMapper } from './quiz-import-question-mapper';

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

describe('QuizImportQuestionMapper', () => {
  it('maps parsed quiz import items to question mutation data', async () => {
    const parser = {
      parse: vi.fn().mockResolvedValue([
        {
          kind: 'truefalse',
          options: [
            { isCorrect: true, position: 0, text: 'true' },
            { isCorrect: false, position: 1, text: 'false' },
          ],
          points: 1000,
          text: 'Is the sky blue?',
          timeLimit: 20,
        },
      ]),
    } as unknown as PlayableContentImportParser;
    const mapper = new QuizImportQuestionMapper(parser, new SelectableOptionPolicy());

    const questions = await mapper.map(new TestPlayableContentImportSource('quiz-import.json'));

    expect(questions).toEqual([
      {
        answers: [
          { id: null, isCorrect: true, position: 0, text: 'true' },
          { id: null, isCorrect: false, position: 1, text: 'false' },
        ],
        points: 1000,
        questionText: 'Is the sky blue?',
        timeLimit: 20,
        type: QuizQuestionType.TrueFalse,
      },
    ]);
  });

  it('maps parser failures to quiz import error codes', async () => {
    const parser = {
      parse: vi.fn().mockImplementation(async () => {
        throw new Error('PLAYABLE_CONTENT_IMPORT_INVALID_FILE');
      }),
    } as unknown as PlayableContentImportParser;
    const mapper = new QuizImportQuestionMapper(parser, new SelectableOptionPolicy());

    await expect(
      mapper.map(new TestPlayableContentImportSource('quiz-import.json')),
    ).rejects.toThrow(QuizErrorCode.QUIZ_IMPORT_INVALID_FILE);
  });
});

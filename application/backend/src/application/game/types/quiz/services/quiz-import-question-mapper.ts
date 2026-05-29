import { Injectable } from '@nestjs/common';
import {
  type QuizQuestionType,
  QuizQuestionType as QuizQuestionTypeEnum,
} from '../../../../../domain/game/types/quiz/entities/quiz-question';
import { QuizErrorCode } from '../../../../../domain/game/types/quiz/enums/quiz-error-code.enum';
import type { QuizQuestionCreationData } from '../../../../../domain/game/types/quiz/ports/quiz-question.repository';
import { SelectableOptionPolicy } from '../../../../../domain/game/types/shared/services/selectable-option-policy';
import {
  PlayableContentImportParser,
  PlayableContentImportParserErrorCode,
} from '../../shared/services/playable-content-import/import-parser';
import type { PlayableContentImportSource } from '../../shared/services/playable-content-import/import-source';

@Injectable()
export class QuizImportQuestionMapper {
  constructor(
    private readonly parser: PlayableContentImportParser,
    private readonly optionPolicy: SelectableOptionPolicy,
  ) {}

  async map(source: PlayableContentImportSource): Promise<readonly QuizQuestionCreationData[]> {
    const importedItems = await this.parse(source);

    return importedItems.map((item) => {
      const questionType = this.resolveQuestionType(item.kind);
      const answers = this.optionPolicy.normalize(item.options);

      if (questionType === QuizQuestionTypeEnum.TrueFalse) {
        this.optionPolicy.assertTrueFalseOptions(answers, {
          emptyOptionText: QuizErrorCode.CORRECT_ANSWER_OPTION_EMPTY,
          invalidCorrectOption: QuizErrorCode.INVALID_CORRECT_ANSWER,
        });
      } else {
        this.optionPolicy.assertMultipleChoiceOptions(answers, {
          emptyOptionText: QuizErrorCode.CORRECT_ANSWER_OPTION_EMPTY,
          invalidCorrectOption: QuizErrorCode.INVALID_CORRECT_ANSWER,
        });
      }

      return {
        answers,
        points: item.points,
        questionText: item.text,
        timeLimit: item.timeLimit,
        type: questionType,
      };
    });
  }

  private async parse(source: PlayableContentImportSource) {
    try {
      return await this.parser.parse(source);
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      if (error.message === PlayableContentImportParserErrorCode.EMPTY_FILE) {
        throw new Error(QuizErrorCode.QUIZ_IMPORT_EMPTY_FILE);
      }

      if (error.message === PlayableContentImportParserErrorCode.UNSUPPORTED_FORMAT) {
        throw new Error(QuizErrorCode.QUIZ_IMPORT_UNSUPPORTED_FORMAT);
      }

      if (error.message === PlayableContentImportParserErrorCode.INVALID_FILE) {
        throw new Error(QuizErrorCode.QUIZ_IMPORT_INVALID_FILE);
      }

      throw error;
    }
  }

  private resolveQuestionType(kind: 'multiple' | 'truefalse'): QuizQuestionType {
    return kind === 'truefalse' ? QuizQuestionTypeEnum.TrueFalse : QuizQuestionTypeEnum.Multiple;
  }
}

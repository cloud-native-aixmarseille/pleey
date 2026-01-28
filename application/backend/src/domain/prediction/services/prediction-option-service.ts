import { Injectable } from '@nestjs/common';
import { VALID_MULTIPLE_CHOICE_OPTIONS } from '../../quiz/constants/question.constants';
import type { PredictionOption, PredictionOptionId } from '../entities/prediction-option';
import { PredictionErrorCode } from '../enums/prediction-error-code.enum';
import type { PredictionOptionInput } from '../ports/prediction-prompt.repository';

type NormalizedPredictionOption = {
  id: PredictionOptionId;
  text: string | null;
  position: number;
  isCorrect: boolean;
};

@Injectable()
export class PredictionOptionService {
  normalizeOptions(options: PredictionOptionInput[]): NormalizedPredictionOption[] {
    return options.map((option, index) => ({
      id: (option.id ?? index) as PredictionOptionId,
      text: option.text?.trim() ?? null,
      position: option.position ?? index,
      isCorrect: Boolean(option.isCorrect),
    }));
  }

  normalizeDomainOptions(options: PredictionOption[]): NormalizedPredictionOption[] {
    return options.map((option) => ({
      id: option.id,
      text: option.text?.trim() ?? null,
      position: option.position,
      isCorrect: option.isCorrect,
    }));
  }

  validateOptions(options: NormalizedPredictionOption[]): void {
    if (options.length < 2) {
      this.throwValidationError(PredictionErrorCode.INVALID_CORRECT_OPTION);
    }

    const correctCount = options.filter((option) => option.isCorrect).length;
    if (correctCount < 1) {
      this.throwValidationError(PredictionErrorCode.INVALID_CORRECT_OPTION);
    }

    const positions = options.map((option) => option.position);
    const uniquePositions = new Set(positions);
    if (uniquePositions.size !== positions.length) {
      this.throwValidationError(PredictionErrorCode.INVALID_CORRECT_OPTION);
    }

    if (options.length > VALID_MULTIPLE_CHOICE_OPTIONS.length) {
      this.throwValidationError(PredictionErrorCode.INVALID_CORRECT_OPTION);
    }

    for (const option of options) {
      if (option.position < 0 || option.position >= VALID_MULTIPLE_CHOICE_OPTIONS.length) {
        this.throwValidationError(PredictionErrorCode.INVALID_CORRECT_OPTION);
      }
      if (!option.text || !option.text.trim()) {
        this.throwValidationError(PredictionErrorCode.OPTION_TEXT_EMPTY);
      }
    }
  }

  private throwValidationError(code: PredictionErrorCode): never {
    throw new Error(code);
  }
}

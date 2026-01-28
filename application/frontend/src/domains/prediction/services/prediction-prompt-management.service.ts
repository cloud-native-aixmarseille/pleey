import { injectable } from 'inversify';
import type {
  CreatePredictionPromptInput,
  PredictionPromptOptionInput,
} from '../entities/prediction-management-input';
import type { PredictionPrompt, PredictionPromptOption } from '../entities/prediction-prompt';
import type {
  PromptFormState,
  PromptOptionFormState,
} from '../entities/prediction-prompt-form-state';
import { PredictionPromptValidationErrorCode } from '../errors/prediction-prompt-validation-error-code';

const DEFAULT_OPTION_COUNT = 4;
const MIN_REQUIRED_OPTION_COUNT = 2;

@injectable()
export class PredictionPromptManagementService {
  createDefaultFormState(): PromptFormState {
    return {
      promptText: '',
      options: this.createDefaultOptionFormState(),
      correctOptionPosition: 1,
      timeLimit: '30',
      points: '100',
    };
  }

  validateForm(formState: PromptFormState): PredictionPromptValidationErrorCode | null {
    if (!formState.promptText.trim()) {
      return PredictionPromptValidationErrorCode.PROMPT_REQUIRED;
    }

    const populatedOptions = formState.options.filter((option) => option.text.trim());
    if (populatedOptions.length < MIN_REQUIRED_OPTION_COUNT) {
      return PredictionPromptValidationErrorCode.OPTIONS_REQUIRED;
    }

    if (!formState.options.some((option) => option.position === formState.correctOptionPosition)) {
      return PredictionPromptValidationErrorCode.CORRECT_OPTION_REQUIRED;
    }

    const timeLimit = Number.parseInt(formState.timeLimit, 10);
    if (!Number.isFinite(timeLimit) || timeLimit <= 0) {
      return PredictionPromptValidationErrorCode.TIME_LIMIT_POSITIVE;
    }

    const points = Number.parseInt(formState.points, 10);
    if (!Number.isFinite(points) || points <= 0) {
      return PredictionPromptValidationErrorCode.POINTS_POSITIVE;
    }

    return null;
  }

  createFormState(prompt: PredictionPrompt): PromptFormState {
    const options = this.toOptionFormState(prompt.options);
    const correct = prompt.options.find((option) => option.isCorrect);

    return {
      promptText: prompt.promptText,
      options,
      correctOptionPosition: correct?.position ?? options[0]?.position ?? 1,
      timeLimit: String(prompt.timeLimit),
      points: String(prompt.points),
    };
  }

  createPayload(
    formState: PromptFormState,
    predictionId: number,
    position: number,
    existingOptions?: readonly PredictionPromptOption[],
  ): CreatePredictionPromptInput {
    return {
      predictionId,
      position,
      promptText: formState.promptText.trim(),
      options: this.toOptionInputs(formState, existingOptions),
      timeLimit: Number.parseInt(formState.timeLimit, 10),
      points: Number.parseInt(formState.points, 10),
    };
  }

  private createDefaultOptionFormState(
    optionCount = DEFAULT_OPTION_COUNT,
  ): readonly PromptOptionFormState[] {
    return Array.from({ length: optionCount }, (_, index) => ({
      position: index + 1,
      text: '',
    }));
  }

  private toOptionFormState(
    options: readonly PredictionPromptOption[],
  ): readonly PromptOptionFormState[] {
    const existingByPosition = new Map(options.map((option) => [option.position, option]));
    const highestPosition = Math.max(
      DEFAULT_OPTION_COUNT,
      ...options.map((option) => option.position),
    );

    return Array.from({ length: highestPosition }, (_, index) => {
      const position = index + 1;
      const option = existingByPosition.get(position);

      return {
        id: option?.id,
        position,
        text: option?.text ?? '',
      };
    });
  }

  private toOptionInputs(
    formState: PromptFormState,
    existingOptions?: readonly PredictionPromptOption[],
  ): readonly PredictionPromptOptionInput[] {
    const existingByPosition = new Map(
      (existingOptions ?? []).map((option) => [option.position, option]),
    );

    return formState.options.map((option) => ({
      id: option.id ?? existingByPosition.get(option.position)?.id,
      text: option.text.trim() ? option.text.trim() : null,
      position: option.position,
      isCorrect: formState.correctOptionPosition === option.position,
    }));
  }
}

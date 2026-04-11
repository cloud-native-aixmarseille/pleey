import {
  SelectableOption,
  type SelectableOptionId,
  type SelectableOptionInput,
} from '../entities/selectable-option';

const FIRST_CHOICE_POSITION = 0;
const MAX_SELECTABLE_OPTIONS = 4;

interface SelectableOptionPolicyErrorCodes {
  readonly invalidCorrectOption: string;
  readonly emptyOptionText: string;
}

export class SelectableOptionPolicy {
  normalize<TId extends SelectableOptionId>(
    options: readonly SelectableOptionInput<TId>[],
  ): SelectableOption<TId>[] {
    return options.map(
      (option, index) =>
        new SelectableOption(
          option.id ?? null,
          option.text?.trim() || null,
          option.position ?? index,
          Boolean(option.isCorrect),
        ),
    );
  }

  assertMultipleChoiceOptions(
    options: readonly SelectableOption[],
    errorCodes: SelectableOptionPolicyErrorCodes,
  ): void {
    this.assertBaseOptions(options, errorCodes.invalidCorrectOption);

    if (options.filter((option) => option.isCorrect).length < 1) {
      throw new Error(errorCodes.invalidCorrectOption);
    }

    if (options.length > MAX_SELECTABLE_OPTIONS) {
      throw new Error(errorCodes.invalidCorrectOption);
    }

    for (const option of options) {
      if (option.position < FIRST_CHOICE_POSITION || option.position >= MAX_SELECTABLE_OPTIONS) {
        throw new Error(errorCodes.invalidCorrectOption);
      }

      if (!option.text) {
        throw new Error(errorCodes.emptyOptionText);
      }
    }
  }

  assertTrueFalseOptions(
    options: readonly SelectableOption[],
    errorCodes: SelectableOptionPolicyErrorCodes,
  ): void {
    this.assertBaseOptions(options, errorCodes.invalidCorrectOption);

    if (options.length !== 2 || options.filter((option) => option.isCorrect).length !== 1) {
      throw new Error(errorCodes.invalidCorrectOption);
    }

    const allowedPositions = new Set([0, 1]);
    for (const option of options) {
      if (!allowedPositions.has(option.position)) {
        throw new Error(errorCodes.invalidCorrectOption);
      }
    }
  }

  private assertBaseOptions(options: readonly SelectableOption[], errorCode: string): void {
    if (options.length < 2) {
      throw new Error(errorCode);
    }

    const positions = options.map((option) => option.position);
    if (new Set(positions).size !== positions.length) {
      throw new Error(errorCode);
    }
  }
}

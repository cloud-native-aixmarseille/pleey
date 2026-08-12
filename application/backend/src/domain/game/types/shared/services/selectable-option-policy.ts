import { createDomainError } from '../../../../shared/errors/domain-error';
import { SelectableOption, type SelectableOptionId, type SelectableOptionInput } from '../entities/selectable-option';

const FIRST_CHOICE_POSITION = 0;
const MAX_SELECTABLE_OPTIONS = 4;

interface SelectableOptionPolicyErrorCodes {
  readonly invalidCorrectOption: string;
  readonly emptyOptionText: string;
}

export class SelectableOptionPolicy {
  normalize<TId extends SelectableOptionId>(options: readonly SelectableOptionInput<TId>[]): SelectableOption<TId>[] {
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
      throw createDomainError(
        {
          code: errorCodes.invalidCorrectOption,
          messageKey: errorCodes.invalidCorrectOption,
        },
        {
          correctOptionCount: options.filter((option) => option.isCorrect).length,
          optionCount: options.length,
        },
      );
    }

    if (options.length > MAX_SELECTABLE_OPTIONS) {
      throw createDomainError(
        {
          code: errorCodes.invalidCorrectOption,
          messageKey: errorCodes.invalidCorrectOption,
        },
        {
          maxSelectableOptions: MAX_SELECTABLE_OPTIONS,
          optionCount: options.length,
        },
      );
    }

    for (const option of options) {
      if (option.position < FIRST_CHOICE_POSITION || option.position >= MAX_SELECTABLE_OPTIONS) {
        throw createDomainError(
          {
            code: errorCodes.invalidCorrectOption,
            messageKey: errorCodes.invalidCorrectOption,
          },
          {
            maxSelectableOptions: MAX_SELECTABLE_OPTIONS,
            optionCount: options.length,
            optionPosition: option.position,
          },
        );
      }

      if (!option.text) {
        throw createDomainError(
          {
            code: errorCodes.emptyOptionText,
            messageKey: errorCodes.emptyOptionText,
          },
          {
            optionPosition: option.position,
          },
        );
      }
    }
  }

  assertTrueFalseOptions(options: readonly SelectableOption[], errorCodes: SelectableOptionPolicyErrorCodes): void {
    this.assertBaseOptions(options, errorCodes.invalidCorrectOption);

    if (options.length !== 2 || options.filter((option) => option.isCorrect).length !== 1) {
      throw createDomainError(
        {
          code: errorCodes.invalidCorrectOption,
          messageKey: errorCodes.invalidCorrectOption,
        },
        {
          correctOptionCount: options.filter((option) => option.isCorrect).length,
          optionCount: options.length,
        },
      );
    }

    const allowedPositions = new Set([0, 1]);
    for (const option of options) {
      if (!allowedPositions.has(option.position)) {
        throw createDomainError(
          {
            code: errorCodes.invalidCorrectOption,
            messageKey: errorCodes.invalidCorrectOption,
          },
          {
            allowedPositions: [0, 1],
            optionPosition: option.position,
          },
        );
      }
    }
  }

  private assertBaseOptions(options: readonly SelectableOption[], errorCode: string): void {
    if (options.length < 2) {
      throw createDomainError(
        {
          code: errorCode,
          messageKey: errorCode,
        },
        {
          optionCount: options.length,
        },
      );
    }

    const positions = options.map((option) => option.position);
    if (new Set(positions).size !== positions.length) {
      throw createDomainError(
        {
          code: errorCode,
          messageKey: errorCode,
        },
        {
          positions,
        },
      );
    }
  }
}

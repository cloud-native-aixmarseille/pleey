import { describe, expect, it } from 'vitest';
import { SelectableOption, type SelectableOptionId } from '../entities/selectable-option';
import { SelectableOptionPolicy } from './selectable-option-policy';

const errorCodes = {
  invalidCorrectOption: 'INVALID_CORRECT_OPTION',
  emptyOptionText: 'EMPTY_OPTION_TEXT',
};

describe('SelectableOptionPolicy', () => {
  const policy = new SelectableOptionPolicy();
  const existingOptionId = '00000000-0000-7000-8000-000000000009' as SelectableOptionId<'TestSelectableOptionId'>;

  it('normalizes option text, ids and fallback positions', () => {
    // Arrange + Act
    const result = policy.normalize([
      { text: '  First  ', isCorrect: true },
      { id: existingOptionId, text: '', position: 4, isCorrect: false },
    ]);

    // Assert
    expect(result).toEqual([
      new SelectableOption(null, 'First', 0, true),
      new SelectableOption(existingOptionId, null, 4, false),
    ]);
  });

  it('accepts multiple-choice options with one correct answer', () => {
    // Arrange + Act + Assert
    expect(() =>
      policy.assertMultipleChoiceOptions(
        [
          new SelectableOption(null, 'A', 0, true),
          new SelectableOption(null, 'B', 1, false),
          new SelectableOption(null, 'C', 2, false),
        ],
        errorCodes,
      ),
    ).not.toThrow();
  });

  it('accepts multiple-choice options with several correct answers', () => {
    // Arrange + Act + Assert
    expect(() =>
      policy.assertMultipleChoiceOptions(
        [
          new SelectableOption(null, 'A', 0, true),
          new SelectableOption(null, 'B', 1, true),
          new SelectableOption(null, 'C', 2, false),
        ],
        errorCodes,
      ),
    ).not.toThrow();
  });

  it('rejects multiple-choice options without any correct answer', () => {
    // Arrange + Act + Assert
    expect(() =>
      policy.assertMultipleChoiceOptions(
        [new SelectableOption(null, 'A', 0, false), new SelectableOption(null, 'B', 1, false)],
        errorCodes,
      ),
    ).toThrow(errorCodes.invalidCorrectOption);
  });

  it('rejects blank multiple-choice option text', () => {
    // Arrange + Act + Assert
    expect(() =>
      policy.assertMultipleChoiceOptions(
        [new SelectableOption(null, 'A', 0, true), new SelectableOption(null, null, 1, false)],
        errorCodes,
      ),
    ).toThrow(errorCodes.emptyOptionText);
  });

  it('accepts true-false options with canonical positions', () => {
    // Arrange + Act + Assert
    expect(() =>
      policy.assertTrueFalseOptions(
        [new SelectableOption(null, null, 0, false), new SelectableOption(null, null, 1, true)],
        errorCodes,
      ),
    ).not.toThrow();
  });

  it('rejects true-false options with non-canonical positions', () => {
    // Arrange + Act + Assert
    expect(() =>
      policy.assertTrueFalseOptions(
        [new SelectableOption(null, null, 0, false), new SelectableOption(null, null, 2, true)],
        errorCodes,
      ),
    ).toThrow(errorCodes.invalidCorrectOption);
  });
});

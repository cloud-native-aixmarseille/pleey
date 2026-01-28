import { describe, expect, it } from 'vitest';
import type { PredictionPrompt, PredictionPromptOption } from '../entities/prediction-prompt';
import type { PromptFormState } from '../entities/prediction-prompt-form-state';
import { PredictionPromptValidationErrorCode } from '../errors/prediction-prompt-validation-error-code';
import { PredictionPromptManagementService } from './prediction-prompt-management.service';

describe('PredictionPromptManagementService', () => {
  const predictionPromptManagementService = new PredictionPromptManagementService();
  const validForm: PromptFormState = {
    promptText: 'Who will win?',
    options: [
      { position: 1, text: 'Team A' },
      { position: 2, text: 'Team B' },
      { position: 3, text: '' },
      { position: 4, text: '' },
    ],
    correctOptionPosition: 1,
    timeLimit: '30',
    points: '100',
  };

  describe('validateForm', () => {
    it('accepts valid forms and rejects invalid numeric values', () => {
      expect(predictionPromptManagementService.validateForm(validForm)).toBeNull();
      expect(
        predictionPromptManagementService.validateForm({ ...validForm, timeLimit: 'nope' }),
      ).toBe(PredictionPromptValidationErrorCode.TIME_LIMIT_POSITIVE);
      expect(predictionPromptManagementService.validateForm({ ...validForm, points: '0' })).toBe(
        PredictionPromptValidationErrorCode.POINTS_POSITIVE,
      );
    });
  });

  describe('createFormState', () => {
    it('maps a prompt to form state', () => {
      const prompt: PredictionPrompt = {
        id: 1,
        predictionId: 10,
        position: 1,
        promptText: 'Who will score first?',
        options: [
          { id: 1, text: 'Player A', position: 1, isCorrect: false },
          { id: 2, text: 'Player B', position: 2, isCorrect: true },
        ],
        timeLimit: 45,
        points: 200,
      };

      const result = predictionPromptManagementService.createFormState(prompt);

      expect(result.correctOptionPosition).toBe(2);
      expect(result.options).toHaveLength(4);
      expect(result.timeLimit).toBe('45');
    });
  });

  describe('createPayload', () => {
    it('builds a payload and preserves existing ids', () => {
      const existing: readonly PredictionPromptOption[] = [
        { id: 42, text: 'Old A', position: 1, isCorrect: true },
        { id: 43, text: 'Old B', position: 2, isCorrect: false },
      ];

      const result = predictionPromptManagementService.createPayload(validForm, 5, 3, existing);

      expect(result.predictionId).toBe(5);
      expect(result.position).toBe(3);
      expect(result.options[0].id).toBe(42);
      expect(result.options[1]).toMatchObject({
        text: 'Team B',
        position: 2,
        isCorrect: false,
      });
    });
  });
});

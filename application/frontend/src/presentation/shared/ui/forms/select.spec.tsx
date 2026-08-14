import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { Select } from './select';

describe('Select', () => {
  describe('render()', () => {
    it('renders the selected option', () => {
      // Arrange + Act
      renderWithUiProvider(
        <label htmlFor="game-type">
          Game type
          <Select id="game-type" onChange={() => undefined} value="quiz">
            <option value="quiz">Quiz</option>
            <option value="prediction">Prediction</option>
          </Select>
        </label>,
      );

      // Assert
      expect(screen.getByLabelText('Game type')).toHaveValue('quiz');
      expect(screen.getByLabelText('Game type')).toHaveDisplayValue('Quiz');
    });

    it('exposes aria-invalid when invalid', () => {
      // Arrange + Act
      renderWithUiProvider(
        <label htmlFor="workspace">
          Workspace
          <Select id="workspace" invalid onChange={() => undefined} value="">
            <option value="">Select</option>
          </Select>
        </label>,
      );

      // Assert
      expect(screen.getByLabelText('Workspace')).toHaveAttribute('aria-invalid', 'true');
    });
  });
});

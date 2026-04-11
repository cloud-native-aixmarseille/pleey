import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { Select } from './select';

describe('Select', () => {
  describe('render()', () => {
    it('renders the selected option', () => {
      renderWithUiProvider(
        <label htmlFor="game-type">
          Game type
          <Select id="game-type" onChange={() => undefined} value="quiz">
            <option value="quiz">Quiz</option>
            <option value="prediction">Prediction</option>
          </Select>
        </label>,
      );

      expect(screen.getByLabelText('Game type')).toHaveValue('quiz');
    });

    it('exposes aria-invalid when invalid', () => {
      renderWithUiProvider(
        <label htmlFor="workspace">
          Workspace
          <Select id="workspace" invalid onChange={() => undefined} value="">
            <option value="">Select</option>
          </Select>
        </label>,
      );

      expect(screen.getByLabelText('Workspace')).toHaveAttribute('aria-invalid', 'true');
    });
  });
});

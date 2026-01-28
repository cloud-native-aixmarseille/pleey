import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { Textarea } from './textarea';

describe('Textarea', () => {
  describe('render()', () => {
    it('renders the provided value', () => {
      renderWithUiProvider(
        <label htmlFor="bio">
          Bio
          <Textarea id="bio" onChange={() => undefined} value="Arcade host" />
        </label>,
      );

      expect(screen.getByLabelText('Bio')).toHaveValue('Arcade host');
    });

    it('exposes aria-invalid when invalid', () => {
      renderWithUiProvider(
        <label htmlFor="notes">
          Notes
          <Textarea id="notes" invalid onChange={() => undefined} value="" />
        </label>,
      );

      expect(screen.getByLabelText('Notes')).toHaveAttribute('aria-invalid', 'true');
    });
  });
});

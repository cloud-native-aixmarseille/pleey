import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../test-utils/render-with-ui-provider';
import { FormSection } from './form-section';

describe('FormSection', () => {
  describe('render()', () => {
    it('renders a grouped fieldset with its legend', () => {
      // Arrange + Act
      renderWithUiProvider(
        <FormSection legend="Credentials">
          <label htmlFor="email">Email</label>
          <input id="email" />
        </FormSection>,
      );

      // Assert
      expect(screen.getByRole('group', { name: 'Credentials' })).toBeInTheDocument();
    });

    it('connects the optional description through aria-describedby', () => {
      // Arrange + Act
      renderWithUiProvider(
        <FormSection description="Use your Pleey workspace account." legend="Workspace access">
          <label htmlFor="email">Email</label>
          <input id="email" />
        </FormSection>,
      );

      // Assert
      expect(screen.getByRole('group', { name: 'Workspace access' })).toHaveAttribute(
        'aria-describedby',
        'workspace-access-description',
      );
    });
  });
});

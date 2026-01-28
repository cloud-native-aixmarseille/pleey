import { describe, it } from 'vitest';
import { FormFieldShell } from '../../presentation/shared/forms/form-field-shell';
import { renderWithProviders } from '../render-with-providers';
import { expectAccessibleField } from './form-accessibility';

describe('form-accessibility', () => {
  describe('expectAccessibleField()', () => {
    it('asserts field label, description, and error wiring', () => {
      // Arrange + Act
      renderWithProviders(
        <FormFieldShell
          description="Use your workspace email."
          error="Email is required."
          id="email"
          label="Email"
        >
          {({ describedBy, invalid }) => (
            <input aria-describedby={describedBy} aria-invalid={invalid} id="email" />
          )}
        </FormFieldShell>,
      );

      // Assert
      expectAccessibleField({
        description: 'Use your workspace email.',
        error: 'Email is required.',
        label: 'Email',
      });
    });
  });
});

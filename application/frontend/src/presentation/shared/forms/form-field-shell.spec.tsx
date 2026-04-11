import { describe, it } from 'vitest';
import { expectAccessibleField } from '../../../test-utils/assertions/form-accessibility';
import { renderWithUiProvider } from '../../../test-utils/render-with-ui-provider';
import { FormFieldShell } from './form-field-shell';

describe('FormFieldShell', () => {
  describe('render()', () => {
    it('connects descriptions and errors to the control', () => {
      // Arrange + Act
      renderWithUiProvider(
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

import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectAccessibleField } from '../../../test-utils/assertions/form-accessibility';
import { renderWithFormProvider } from '../../../test-utils/render-with-form-provider';
import { PresentationForm } from './presentation-form';
import { SelectFormField } from './select-form-field';
import { usePresentationForm } from './use-presentation-form';

function SelectFormFieldHarness() {
  const form = usePresentationForm({
    defaultValues: {
      gameType: '',
    },
    onSubmit: async () => undefined,
  });

  return (
    <form.AppForm>
      <PresentationForm form={form}>
        <form.AppField
          name="gameType"
          validators={{
            onBlur: ({ value }) =>
              value.trim().length === 0 ? 'Game type is required.' : undefined,
          }}
        >
          {() => (
            <SelectFormField
              description="Choose the game family to configure."
              label="Game type"
              options={[
                { label: 'Quiz', value: 'quiz' },
                { label: 'Prediction', value: 'prediction' },
              ]}
              placeholder="Select a game type"
              required
            />
          )}
        </form.AppField>
      </PresentationForm>
    </form.AppForm>
  );
}

describe('SelectFormField', () => {
  describe('render()', () => {
    it('renders the placeholder and the available options', () => {
      // Arrange + Act
      renderWithFormProvider(<SelectFormFieldHarness />);

      // Assert
      expect(screen.getByRole('option', { name: 'Select a game type' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Quiz' })).toBeInTheDocument();
    });

    it('connects the description and validation error to the select control', () => {
      // Arrange
      renderWithFormProvider(<SelectFormFieldHarness />);

      // Act
      fireEvent.blur(expectAccessibleField({ label: 'Game type *' }));

      // Assert
      expectAccessibleField({
        description: 'Choose the game family to configure.',
        error: 'Game type is required.',
        label: 'Game type *',
      });
    });
  });
});

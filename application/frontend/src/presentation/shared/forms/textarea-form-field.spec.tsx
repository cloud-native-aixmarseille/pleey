import { fireEvent } from '@testing-library/react';
import { describe, it } from 'vitest';
import { expectAccessibleField } from '../../../test-utils/assertions/form-accessibility';
import { renderWithFormProvider } from '../../../test-utils/render-with-form-provider';
import { PresentationForm } from './presentation-form';
import { TextareaFormField } from './textarea-form-field';
import { usePresentationForm } from './use-presentation-form';

function TextareaFormFieldHarness() {
  const form = usePresentationForm({
    defaultValues: {
      notes: '',
    },
    onSubmit: async () => undefined,
  });

  return (
    <form.AppForm>
      <PresentationForm form={form}>
        <form.AppField
          name="notes"
          validators={{
            onBlur: ({ value }) => (value.trim().length === 0 ? 'Notes are required.' : undefined),
          }}
        >
          {() => (
            <TextareaFormField
              description="Add host notes for the current game."
              label="Notes"
              placeholder="Write game notes"
              required
            />
          )}
        </form.AppField>
      </PresentationForm>
    </form.AppForm>
  );
}

describe('TextareaFormField', () => {
  describe('render()', () => {
    it('connects the description and validation error to the field', () => {
      // Arrange
      renderWithFormProvider(<TextareaFormFieldHarness />);

      // Act
      fireEvent.blur(expectAccessibleField({ label: 'Notes *' }));

      // Assert
      expectAccessibleField({
        description: 'Add host notes for the current game.',
        error: 'Notes are required.',
        label: 'Notes *',
      });
    });
  });
});

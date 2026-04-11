import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithFormProvider } from '../../../test-utils/render-with-form-provider';
import { PresentationForm } from './presentation-form';
import { TextFormField } from './text-form-field';
import { usePresentationForm } from './use-presentation-form';

function TextFormFieldHarness() {
  const form = usePresentationForm({
    defaultValues: {
      email: '',
    },
    onSubmit: async () => undefined,
  });

  return (
    <form.AppForm>
      <PresentationForm form={form}>
        <form.AppField
          name="email"
          validators={{
            onBlur: ({ value }) => (value.trim().length === 0 ? 'Email is required.' : undefined),
          }}
        >
          {() => <TextFormField label="Email" placeholder="captain@pleey.io" required />}
        </form.AppField>
      </PresentationForm>
    </form.AppForm>
  );
}

describe('TextFormField', () => {
  describe('render()', () => {
    it('renders the registered field component label', () => {
      // Arrange + Act
      renderWithFormProvider(<TextFormFieldHarness />);

      // Assert
      expect(screen.getByLabelText('Email *')).toBeInTheDocument();
    });

    it('renders the validation message after blur', () => {
      // Arrange
      renderWithFormProvider(<TextFormFieldHarness />);

      // Act
      fireEvent.blur(screen.getByLabelText('Email *'));

      // Assert
      expect(screen.getByRole('alert')).toHaveTextContent('Email is required.');
    });
  });
});

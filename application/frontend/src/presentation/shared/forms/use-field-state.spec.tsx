import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithFormProvider } from '../../../test-utils/render-with-form-provider';
import { FormFieldShell } from './form-field-shell';
import { PresentationForm } from './presentation-form';
import { useFieldState } from './use-field-state';
import { usePresentationForm } from './use-presentation-form';

function FieldStateHarness() {
  const { field, fieldId, error } = useFieldState<string>();

  return (
    <FormFieldShell description="Enter your email" error={error} id={fieldId} label="Email">
      {({ describedBy, invalid }) => (
        <input
          aria-describedby={describedBy}
          aria-invalid={invalid}
          id={fieldId}
          name={String(field.name)}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
          value={field.state.value ?? ''}
        />
      )}
    </FormFieldShell>
  );
}

function UseFieldStateHarness() {
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
          {() => <FieldStateHarness />}
        </form.AppField>
      </PresentationForm>
    </form.AppForm>
  );
}

describe('useFieldState', () => {
  describe('useFieldState()', () => {
    it('derives the field id from the field name', () => {
      renderWithFormProvider(<UseFieldStateHarness />);

      expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'email');
    });

    it('exposes no error before the field is touched', () => {
      renderWithFormProvider(<UseFieldStateHarness />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('exposes the validation error after blur', () => {
      renderWithFormProvider(<UseFieldStateHarness />);

      fireEvent.blur(screen.getByLabelText('Email'));

      expect(screen.getByRole('alert')).toHaveTextContent('Email is required.');
    });
  });
});

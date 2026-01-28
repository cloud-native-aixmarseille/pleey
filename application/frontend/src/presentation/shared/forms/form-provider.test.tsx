import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { FormPort } from '../../../application/shared/contracts/form.port';
import { PresentationFormProvider, usePresentationFormPort } from './form-provider';

function FormProviderHarness() {
  const port = usePresentationFormPort();

  return <span>{typeof port.useForm}</span>;
}

describe('PresentationFormProvider', () => {
  describe('render()', () => {
    it('provides the form port to presentation consumers', () => {
      // Arrange
      const port: FormPort = {
        useForm: () => ({
          handleSubmit: () => undefined,
          reset: () => undefined,
          AppForm: ({ children }) => <>{children}</>,
          AppField: ({ children }) => children(),
        }),
        useFieldContext: <TValue = string>() => ({
          name: 'email',
          state: { value: '' as TValue, meta: { isTouched: false, errors: [] } },
          handleBlur: () => undefined,
          handleChange: (_value: TValue) => undefined,
        }),
        useFormContext: () => ({
          Subscribe: ({ children, selector }) => <>{children(selector({ isSubmitting: false }))}</>,
        }),
      };

      // Act
      render(
        <PresentationFormProvider value={port}>
          <FormProviderHarness />
        </PresentationFormProvider>,
      );

      // Assert
      expect(screen.getByText('function')).toBeInTheDocument();
    });
  });
});

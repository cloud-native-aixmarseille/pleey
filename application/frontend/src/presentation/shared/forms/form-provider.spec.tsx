import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { PresentationFormProvider, usePresentationFormPort } from './form-provider';

type PresentationFormPort = Parameters<typeof PresentationFormProvider>[0]['value'];

const MockAppForm: ReturnType<PresentationFormPort['useForm']>['AppForm'] = ({ children }) => <>{children}</>;
const MockSubscribe: ReturnType<PresentationFormPort['useFormContext']>['Subscribe'] = ({ children, selector }) => (
  <>{children(selector({ isSubmitting: false, isDefaultValue: true }))}</>
);

function MockAppField({ children }: { readonly children: () => ReactNode }) {
  return children();
}

function FormProviderHarness() {
  const port = usePresentationFormPort();

  return <span>{typeof port.useForm}</span>;
}

describe('PresentationFormProvider', () => {
  describe('render()', () => {
    it('provides the form port to presentation consumers', () => {
      // Arrange
      const port: PresentationFormPort = {
        useForm: () => ({
          handleSubmit: () => undefined,
          reset: () => undefined,
          AppForm: MockAppForm,
          AppField: MockAppField,
        }),
        useFieldContext: <TValue = string>() => ({
          name: 'email',
          state: { value: '' as TValue, meta: { isTouched: false, errors: [] } },
          handleBlur: () => undefined,
          handleChange: (_value: TValue) => undefined,
        }),
        useFormContext: () => ({
          Subscribe: MockSubscribe,
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

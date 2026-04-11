import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { FieldShell } from './field-shell';

describe('FieldShell', () => {
  describe('render()', () => {
    it('renders the label and required marker for the wrapped field', () => {
      renderWithUiProvider(
        <FieldShell id="email" label="Email" required>
          <input id="email" />
        </FieldShell>,
      );

      expect(screen.getByLabelText('Email *')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('renders the description and error content', () => {
      renderWithUiProvider(
        <FieldShell
          description="Use your workspace email."
          error="Email is required."
          errorId="email-error"
          id="email"
          label="Email"
        >
          <input aria-describedby="email-error" id="email" />
        </FieldShell>,
      );

      expect(screen.getByText('Use your workspace email.')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('Email is required.');
    });
  });
});

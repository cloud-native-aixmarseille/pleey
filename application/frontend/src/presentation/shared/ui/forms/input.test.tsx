import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { Input } from './input';

describe('Input', () => {
  describe('render()', () => {
    it('renders the provided value', () => {
      renderWithUiProvider(
        <label htmlFor="email">
          Email
          <Input id="email" value="captain@pleey.io" onChange={() => undefined} />
        </label>,
      );

      expect(screen.getByLabelText('Email')).toHaveValue('captain@pleey.io');
    });

    it('exposes aria-invalid when the field is invalid', () => {
      renderWithUiProvider(
        <label htmlFor="password">
          Password
          <Input id="password" invalid onChange={() => undefined} value="" />
        </label>,
      );

      expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true');
    });
  });
});

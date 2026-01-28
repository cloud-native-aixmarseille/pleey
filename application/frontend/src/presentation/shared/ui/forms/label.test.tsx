import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { Label } from './label';

describe('Label', () => {
  describe('render()', () => {
    it('labels the associated control', () => {
      renderWithUiProvider(
        <div>
          <Label htmlFor="email">Email</Label>
          <input id="email" />
        </div>,
      );

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });
  });
});

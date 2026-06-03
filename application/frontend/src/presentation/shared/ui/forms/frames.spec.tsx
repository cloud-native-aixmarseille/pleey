import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { FormRoot, FormSectionFrame } from './frames';

describe('frames', () => {
  describe('FormRoot()', () => {
    it('renders a form element', () => {
      renderWithUiProvider(
        <FormRoot aria-label="Profile form">
          <span>content</span>
        </FormRoot>,
      );

      expect(screen.getByRole('form', { name: 'Profile form' })).toBeInTheDocument();
    });
  });

  describe('FormSectionFrame()', () => {
    it('renders legend and description when provided', () => {
      renderWithUiProvider(
        <FormSectionFrame description="Section details" legend="Account">
          <span>section child</span>
        </FormSectionFrame>,
      );

      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByText('Section details')).toBeInTheDocument();
      expect(screen.getByText('section child')).toBeInTheDocument();
    });
  });
});

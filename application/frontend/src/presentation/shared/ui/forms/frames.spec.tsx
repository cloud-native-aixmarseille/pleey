import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { FormFieldFrame, FormRoot, FormSectionFrame } from './frames';
import { Input } from './input';

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

  describe('FormFieldFrame()', () => {
    it('renders label, field description, and error message', () => {
      renderWithUiProvider(
        <FormFieldFrame
          description="Use a strong password"
          error="Password is required"
          id="password"
          label="Password"
          required
        >
          <Input id="password" onChange={() => undefined} value="" />
        </FormFieldFrame>,
      );

      expect(screen.getByLabelText('Password *')).toBeInTheDocument();
      expect(screen.getByText('Use a strong password')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('Password is required');
    });
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppProviders } from './app-providers';

describe('AppProviders', () => {
  describe('render()', () => {
    it('renders its children', () => {
      // Arrange + Act
      render(
        <AppProviders>
          <span data-testid="child">content</span>
        </AppProviders>,
      );

      // Assert
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      // Arrange + Act
      render(
        <AppProviders>
          <span data-testid="first">a</span>
          <span data-testid="second">b</span>
        </AppProviders>,
      );

      // Assert
      expect(screen.getByTestId('first')).toBeInTheDocument();
      expect(screen.getByTestId('second')).toBeInTheDocument();
    });
  });
});

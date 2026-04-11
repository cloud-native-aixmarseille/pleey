import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createAppProviderFactories } from './app-provider-factory';
import { AppProviders } from './app-providers';
import { createAppContainer } from './create-app-container';

const container = createAppContainer();
const providerFactories = createAppProviderFactories(container);

describe('AppProviders', () => {
  describe('render()', () => {
    it('renders its children', () => {
      // Arrange + Act
      render(
        <AppProviders providerFactories={providerFactories}>
          <span data-testid="child">content</span>
        </AppProviders>,
      );

      // Assert
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      // Arrange + Act
      render(
        <AppProviders providerFactories={providerFactories}>
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

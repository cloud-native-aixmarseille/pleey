import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { PageContainer } from './containers';
import { SupportingText } from './typography';

describe('primitives', () => {
  describe('PageContainer()', () => {
    it('renders children', () => {
      // Arrange + Act
      renderWithUiProvider(
        <PageContainer>
          <span data-testid="inner">Inner</span>
        </PageContainer>,
      );

      // Assert
      expect(screen.getByTestId('inner')).toBeInTheDocument();
    });
  });

  describe('SupportingText()', () => {
    it('renders provided content', () => {
      // Arrange + Act
      renderWithUiProvider(<SupportingText>Support copy</SupportingText>);

      // Assert
      expect(screen.getByText('Support copy')).toBeInTheDocument();
    });
  });
});

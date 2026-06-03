import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { PageContainer } from './containers';
import { SupportingText } from './typography';

describe('primitives', () => {
  describe('PageContainer()', () => {
    it('renders children', () => {
      renderWithUiProvider(
        <PageContainer>
          <span data-testid="inner">Inner</span>
        </PageContainer>,
      );

      expect(screen.getByTestId('inner')).toBeInTheDocument();
    });
  });

  describe('SupportingText()', () => {
    it('renders provided content', () => {
      renderWithUiProvider(<SupportingText>Support copy</SupportingText>);

      expect(screen.getByText('Support copy')).toBeInTheDocument();
    });
  });
});

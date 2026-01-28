import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { ActionRow, ContentStack, PageContainer, ResponsiveGrid, WrapRow } from './containers';

describe('containers', () => {
  describe('PageContainer()', () => {
    it('renders children', () => {
      renderWithUiProvider(
        <PageContainer>
          <span data-testid="child">Content</span>
        </PageContainer>,
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });

  describe('ResponsiveGrid()', () => {
    it('renders children in a grid', () => {
      renderWithUiProvider(
        <ResponsiveGrid columns={{ base: 2 }}>
          <div>A</div>
          <div>B</div>
        </ResponsiveGrid>,
      );

      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
    });
  });

  describe('ActionRow()', () => {
    it('renders children horizontally', () => {
      renderWithUiProvider(
        <ActionRow>
          <button type="button">One</button>
          <button type="button">Two</button>
        </ActionRow>,
      );

      expect(screen.getByRole('button', { name: 'One' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Two' })).toBeInTheDocument();
    });
  });

  describe('ContentStack()', () => {
    it('renders children in a vertical stack', () => {
      renderWithUiProvider(
        <ContentStack>
          <p>First</p>
          <p>Second</p>
        </ContentStack>,
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  describe('WrapRow()', () => {
    it('renders children that wrap', () => {
      renderWithUiProvider(
        <WrapRow>
          <span>Tag A</span>
          <span>Tag B</span>
        </WrapRow>,
      );

      expect(screen.getByText('Tag A')).toBeInTheDocument();
      expect(screen.getByText('Tag B')).toBeInTheDocument();
    });
  });
});

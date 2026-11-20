import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import {
  ActionRow,
  AutoFillGrid,
  ContentStack,
  PageContainer,
  ResponsiveGrid,
  SectionContainer,
  SplitWrapRow,
  WrapRow,
} from './containers';

describe('containers', () => {
  describe('PageContainer()', () => {
    it('renders children', () => {
      // Arrange + Act
      renderWithUiProvider(
        <PageContainer>
          <span data-testid="child">Content</span>
        </PageContainer>,
      );

      // Assert
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });

  describe('ResponsiveGrid()', () => {
    it('renders children in a grid', () => {
      // Arrange + Act
      renderWithUiProvider(
        <ResponsiveGrid columns={{ base: 2 }}>
          <div>A</div>
          <div>B</div>
        </ResponsiveGrid>,
      );

      // Assert
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
    });
  });

  describe('ActionRow()', () => {
    it('renders children horizontally', () => {
      // Arrange + Act
      renderWithUiProvider(
        <ActionRow>
          <button type="button">One</button>
          <button type="button">Two</button>
        </ActionRow>,
      );

      // Assert
      expect(screen.getByRole('button', { name: 'One' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Two' })).toBeInTheDocument();
    });
  });

  describe('ContentStack()', () => {
    it('renders children in a vertical stack', () => {
      // Arrange + Act
      renderWithUiProvider(
        <ContentStack>
          <p>First</p>
          <p>Second</p>
        </ContentStack>,
      );

      // Assert
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  describe('SectionContainer()', () => {
    it('renders children inside a constrained section wrapper', () => {
      // Arrange + Act
      renderWithUiProvider(
        <SectionContainer>
          <p>Section content</p>
        </SectionContainer>,
      );

      // Assert
      expect(screen.getByText('Section content')).toBeInTheDocument();
    });
  });

  describe('WrapRow()', () => {
    it('renders children that wrap', () => {
      // Arrange + Act
      renderWithUiProvider(
        <WrapRow>
          <span>Tag A</span>
          <span>Tag B</span>
        </WrapRow>,
      );

      // Assert
      expect(screen.getByText('Tag A')).toBeInTheDocument();
      expect(screen.getByText('Tag B')).toBeInTheDocument();
    });
  });

  describe('SplitWrapRow()', () => {
    it('renders children in a row that can distribute content', () => {
      // Arrange + Act
      renderWithUiProvider(
        <SplitWrapRow>
          <span>Leading</span>
          <span>Trailing</span>
        </SplitWrapRow>,
      );

      // Assert
      expect(screen.getByText('Leading')).toBeInTheDocument();
      expect(screen.getByText('Trailing')).toBeInTheDocument();
    });
  });

  describe('AutoFillGrid()', () => {
    it('renders children inside an auto-filling grid', () => {
      // Arrange + Act
      renderWithUiProvider(
        <AutoFillGrid minItemWidth="8rem">
          <div>Card A</div>
          <div>Card B</div>
        </AutoFillGrid>,
      );

      // Assert
      expect(screen.getByText('Card A')).toBeInTheDocument();
      expect(screen.getByText('Card B')).toBeInTheDocument();
    });
  });
});

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

  describe('SectionContainer()', () => {
    it('renders children inside a constrained section wrapper', () => {
      renderWithUiProvider(
        <SectionContainer>
          <p>Section content</p>
        </SectionContainer>,
      );

      expect(screen.getByText('Section content')).toBeInTheDocument();
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

  describe('SplitWrapRow()', () => {
    it('renders children in a row that can distribute content', () => {
      renderWithUiProvider(
        <SplitWrapRow>
          <span>Leading</span>
          <span>Trailing</span>
        </SplitWrapRow>,
      );

      expect(screen.getByText('Leading')).toBeInTheDocument();
      expect(screen.getByText('Trailing')).toBeInTheDocument();
    });
  });

  describe('AutoFillGrid()', () => {
    it('renders children inside an auto-filling grid', () => {
      renderWithUiProvider(
        <AutoFillGrid minItemWidth="8rem">
          <div>Card A</div>
          <div>Card B</div>
        </AutoFillGrid>,
      );

      expect(screen.getByText('Card A')).toBeInTheDocument();
      expect(screen.getByText('Card B')).toBeInTheDocument();
    });
  });
});

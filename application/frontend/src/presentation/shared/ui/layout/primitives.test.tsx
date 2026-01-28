import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { ActionRow, PageContainer } from './containers';
import { ShellHeader } from './shell-header';
import { BulletList, SupportingText } from './typography';

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

  describe('ShellHeader()', () => {
    it('renders kicker, title, subtitle, and navigation', () => {
      renderWithUiProvider(
        <ShellHeader
          kicker="Kicker"
          navigation={
            <ActionRow>
              <a href="/x">Nav</a>
            </ActionRow>
          }
          subtitle="Subtitle text"
          title="Header title"
        />,
      );

      expect(screen.getByText('Kicker')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Header title' })).toBeInTheDocument();
      expect(screen.getByText('Subtitle text')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Nav' })).toHaveAttribute('href', '/x');
    });
  });

  describe('BulletList()', () => {
    it('renders all list items', () => {
      renderWithUiProvider(<BulletList items={['First', 'Second']} />);

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  describe('SupportingText()', () => {
    it('renders provided content', () => {
      renderWithUiProvider(<SupportingText>Support copy</SupportingText>);

      expect(screen.getByText('Support copy')).toBeInTheDocument();
    });
  });
});

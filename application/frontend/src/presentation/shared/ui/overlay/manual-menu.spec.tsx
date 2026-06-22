import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { ManualMenuPanel, ManualMenuWrapper } from './manual-menu';

describe('ManualMenu', () => {
  it('renders wrapper children', () => {
    renderWithUiProvider(
      <ManualMenuWrapper>
        <button type="button">Open menu</button>
      </ManualMenuWrapper>,
    );

    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
  });

  it('renders a menu panel by default', () => {
    renderWithUiProvider(
      <ManualMenuPanel>
        <span>Menu item</span>
      </ManualMenuPanel>,
    );

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Menu item')).toBeInTheDocument();
  });

  it('supports a custom role for non-menu surfaces', () => {
    renderWithUiProvider(
      <ManualMenuPanel role="group">
        <span>Grouped content</span>
      </ManualMenuPanel>,
    );

    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByText('Grouped content')).toBeInTheDocument();
  });
});

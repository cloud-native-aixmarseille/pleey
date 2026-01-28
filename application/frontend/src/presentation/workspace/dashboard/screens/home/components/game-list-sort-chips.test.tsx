import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../../../test-utils/render-with-providers';
import { GameListSortChips } from './game-list-sort-chips';

describe('GameListSortChips', () => {
  it('marks the active field and forwards the selected sort field and default direction', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    renderWithProviders(
      <GameListSortChips
        currentDirection="desc"
        currentField="createdAt"
        label="Sort games"
        onToggle={onToggle}
        sortDirectionIcon={() => 'sort-desc'}
        sortFields={[
          { field: 'createdAt', defaultDirection: 'desc', labelKey: 'sort.createdAt' },
          { field: 'title', defaultDirection: 'asc', labelKey: 'sort.title' },
        ]}
        translate={(key) => key}
      />,
    );

    expect(screen.getByRole('button', { name: /sort.createdAt/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: /sort.title/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    await user.click(screen.getByRole('button', { name: /sort.title/i }));

    expect(onToggle).toHaveBeenCalledWith('title', 'asc');
  });
});

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../../../test-utils/render-with-ui-provider';
import { PaginationBar } from './pagination-bar';

vi.mock('../../../../../shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

describe('PaginationBar', () => {
  it('renders nothing when only one page is available', () => {
    renderWithUiProvider(<PaginationBar currentPage={1} onPageChange={vi.fn()} totalPages={1} />);

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('disables the previous action on the first page', () => {
    renderWithUiProvider(<PaginationBar currentPage={1} onPageChange={vi.fn()} totalPages={4} />);

    expect(
      screen.getByRole('button', { name: 'dashboard.games.pagination.previous' }),
    ).toBeDisabled();
  });

  it('calls onPageChange with the next page when next is clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    renderWithUiProvider(
      <PaginationBar currentPage={2} onPageChange={onPageChange} totalPages={4} />,
    );

    await user.click(screen.getByRole('button', { name: 'dashboard.games.pagination.next' }));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});

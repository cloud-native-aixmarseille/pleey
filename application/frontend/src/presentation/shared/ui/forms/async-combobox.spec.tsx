import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { AsyncCombobox } from './async-combobox';

describe('AsyncCombobox', () => {
  it('delegates search changes and selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSearchChange = vi.fn();

    renderWithUiProvider(
      <AsyncCombobox
        ariaLabel="Organization"
        emptyLabel="No organizations yet"
        loadingLabel="Loading organizations"
        noResultsLabel="No organizations found"
        onChange={onChange}
        onSearchChange={onSearchChange}
        options={[
          { value: '1', label: 'Pleey Org' },
          { value: '2', label: 'Rocket Org' },
        ]}
        placeholder="Choose an organization"
        searchAriaLabel="Search organizations"
        searchPlaceholder="Search organizations"
        value={null}
      />,
    );

    await user.click(screen.getByLabelText('Organization'));
    await user.type(screen.getByLabelText('Search organizations'), 'Rocket');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(onSearchChange).toHaveBeenLastCalledWith('');
    expect(onChange).toHaveBeenCalledWith('2');
  });

  it('requests more options when the list is scrolled near the end', async () => {
    const user = userEvent.setup();
    const onLoadMore = vi.fn();

    renderWithUiProvider(
      <AsyncCombobox
        ariaLabel="Project"
        emptyLabel="No projects yet"
        hasMore
        loadingLabel="Loading projects"
        noResultsLabel="No projects found"
        onChange={vi.fn()}
        onLoadMore={onLoadMore}
        options={Array.from({ length: 8 }, (_, index) => ({
          value: String(index + 1),
          label: `Main event ${index + 1}`,
        }))}
        placeholder="Choose a project"
        searchAriaLabel="Search projects"
        searchPlaceholder="Search projects"
        value={null}
      />,
    );

    await user.click(screen.getByLabelText('Project'));

    const viewport = screen
      .getByLabelText('Search projects')
      .closest('[role="presentation"]')
      ?.querySelector(
        '[data-radix-scroll-area-viewport], [data-scroll-area-viewport], .mantine-ScrollArea-viewport',
      );

    if (!(viewport instanceof HTMLElement)) {
      throw new Error('scroll viewport not found');
    }

    Object.defineProperty(viewport, 'clientHeight', { configurable: true, value: 120 });
    Object.defineProperty(viewport, 'scrollHeight', { configurable: true, value: 320 });
    viewport.scrollTop = 210;
    fireEvent.scroll(viewport);

    await waitFor(() => {
      expect(onLoadMore).toHaveBeenCalledTimes(1);
    });
  });
});

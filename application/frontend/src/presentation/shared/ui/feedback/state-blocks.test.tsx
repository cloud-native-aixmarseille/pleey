import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { EmptyState, LoadingState, PendingState } from './state-blocks';

describe('EmptyState', () => {
  it('renders the empty message', () => {
    renderWithUiProvider(<EmptyState>No items found.</EmptyState>);

    expect(screen.getByText('No items found.')).toBeInTheDocument();
  });
});

describe('LoadingState', () => {
  it('renders the loading message with accessibility attributes', () => {
    renderWithUiProvider(<LoadingState>Loading…</LoadingState>);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Loading…');
    expect(status).toHaveAttribute('aria-busy', 'true');
  });

  it('renders skeleton placeholders for card loading states', () => {
    const { container } = renderWithUiProvider(
      <LoadingState variant="cards">Loading cards…</LoadingState>,
    );

    expect(statusFrom(container)).toHaveTextContent('Loading cards…');
    expect(container.querySelectorAll('.mantine-Skeleton-root').length).toBeGreaterThan(0);
  });
});

function statusFrom(container: HTMLElement) {
  const status = container.querySelector('output[aria-busy="true"]');

  if (!status) {
    throw new Error('Expected loading status element to be rendered');
  }

  return status;
}

describe('PendingState', () => {
  it('renders the pending message', () => {
    renderWithUiProvider(<PendingState>Select a project first.</PendingState>);

    expect(screen.getByText('Select a project first.')).toBeInTheDocument();
  });
});

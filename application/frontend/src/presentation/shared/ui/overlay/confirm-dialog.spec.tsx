import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { ConfirmDialog } from './confirm-dialog';

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    addEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
  }));
}

describe('ConfirmDialog', () => {
  const defaults = {
    isOpen: true,
    message: 'Are you sure you want to delete this item?',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the message when open', () => {
    renderWithUiProvider(<ConfirmDialog {...defaults} />);

    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
  });

  it('renders nothing visible when closed', () => {
    renderWithUiProvider(<ConfirmDialog {...defaults} isOpen={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders a dialog role with aria-modal', () => {
    renderWithUiProvider(<ConfirmDialog {...defaults} />);

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('renders an optional title', () => {
    renderWithUiProvider(<ConfirmDialog {...defaults} title="Confirm deletion" />);

    expect(screen.getByText('Confirm deletion')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const onConfirm = vi.fn();
    renderWithUiProvider(<ConfirmDialog {...defaults} onConfirm={onConfirm} />);

    await userEvent.click(screen.getByText('Delete'));

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn();
    renderWithUiProvider(<ConfirmDialog {...defaults} onCancel={onCancel} />);

    await userEvent.click(screen.getByText('Cancel'));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('renders both action buttons', () => {
    renderWithUiProvider(<ConfirmDialog {...defaults} />);

    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('disables the confirm button when requested', () => {
    renderWithUiProvider(<ConfirmDialog {...defaults} confirmDisabled />);

    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });

  it('keeps both actions accessible on mobile layouts', () => {
    stubMatchMedia(true);

    renderWithUiProvider(<ConfirmDialog {...defaults} />);

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

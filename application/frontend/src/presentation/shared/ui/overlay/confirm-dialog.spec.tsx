import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
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

  function resetGlobals() {
    vi.unstubAllGlobals();
  }

  it('renders the message when open', () => {
    // Arrange + Act
    renderWithUiProvider(<ConfirmDialog {...defaults} />);

    // Assert
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
  });

  it('renders nothing visible when closed', () => {
    // Arrange + Act
    renderWithUiProvider(<ConfirmDialog {...defaults} isOpen={false} />);

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders a dialog role with aria-modal', () => {
    // Arrange + Act
    renderWithUiProvider(<ConfirmDialog {...defaults} />);

    // Assert
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('renders an optional title', () => {
    // Arrange + Act
    renderWithUiProvider(<ConfirmDialog {...defaults} title="Confirm deletion" />);

    // Assert
    expect(screen.getByText('Confirm deletion')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    // Arrange
    const onConfirm = vi.fn();
    renderWithUiProvider(<ConfirmDialog {...defaults} onConfirm={onConfirm} />);

    // Act
    await userEvent.click(screen.getByText('Delete'));

    // Assert
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    // Arrange
    const onCancel = vi.fn();
    renderWithUiProvider(<ConfirmDialog {...defaults} onCancel={onCancel} />);

    // Act
    await userEvent.click(screen.getByText('Cancel'));

    // Assert
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('renders both action buttons', () => {
    // Arrange + Act
    renderWithUiProvider(<ConfirmDialog {...defaults} />);

    // Assert
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('disables the confirm button when requested', () => {
    // Arrange + Act
    renderWithUiProvider(<ConfirmDialog {...defaults} confirmDisabled />);

    // Assert
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });

  it('keeps both actions accessible on mobile layouts', () => {
    // Arrange + Act
    stubMatchMedia(true);

    // Assert
    try {
      renderWithUiProvider(<ConfirmDialog {...defaults} />);

      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    } finally {
      resetGlobals();
    }
  });
});

import { act, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { QrShareCard } from './qr-share-card';

vi.mock('react-qr-code', async () => {
  const { ReactQrCodeMockFactory } = await import('src/test-utils/mocks/react-qr-code-mock-factory');

  return new ReactQrCodeMockFactory().createModule();
});

describe('QrShareCard', () => {
  it('renders a qr code and share link details', () => {
    // Arrange + Act
    renderWithUiProvider(
      <QrShareCard href="https://pleey.example.com/join/AB12CD" scanLabel="Scan to join" visitLabel="Or visit" />,
    );

    // Assert
    expect(screen.getByTestId('qr-code')).toHaveTextContent('https://pleey.example.com/join/AB12CD');
    expect(screen.getByText('Scan to join')).toBeInTheDocument();
    expect(screen.getByText('Or visit')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'pleey.example.com/join/AB12CD' })).toHaveAttribute(
      'href',
      'https://pleey.example.com/join/AB12CD',
    );
  });

  it('copies the share link when a copy action is provided', async () => {
    // Arrange
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    // Act
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    // Assert
    try {
      renderWithUiProvider(
        <QrShareCard
          copyLabel="Copy link"
          href="https://pleey.example.com/join/AB12CD"
          scanLabel="Scan to join"
          visitLabel="Or visit"
        />,
      );

      await act(async () => {
        screen.getByRole('button', { name: 'Copy link' }).click();
        await Promise.resolve();
      });

      expect(writeText).toHaveBeenCalledWith('https://pleey.example.com/join/AB12CD');
      expect(screen.getByRole('button', { name: '✓' })).toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(2_100);
      });

      expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows a failure message when copying fails', async () => {
    // Arrange
    vi.useFakeTimers();
    // Act
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });

    // Assert
    try {
      renderWithUiProvider(
        <QrShareCard
          copyLabel="Copy link"
          href="https://pleey.example.com/join/AB12CD"
          scanLabel="Scan to join"
          visitLabel="Or visit"
        />,
      );

      await act(async () => {
        screen.getByRole('button', { name: 'Copy link' }).click();
        await Promise.resolve();
      });

      expect(screen.getByRole('button', { name: '✕' })).toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(2_100);
      });

      expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});

import { act, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { QrShareCard } from './qr-share-card';

async function waitForStatusReset() {
  await act(async () => {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 2_100);
    });
  });
}

vi.mock('react-qr-code', async () => {
  const { ReactQrCodeMockFactory } = await import(
    'src/test-utils/mocks/react-qr-code-mock-factory'
  );

  return new ReactQrCodeMockFactory().createModule();
});

describe('QrShareCard', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a qr code and share link details', () => {
    renderWithUiProvider(
      <QrShareCard
        href="https://pleey.example.com/join/AB12CD"
        scanLabel="Scan to join"
        visitLabel="Or visit"
      />,
    );

    expect(screen.getByTestId('qr-code')).toHaveTextContent(
      'https://pleey.example.com/join/AB12CD',
    );
    expect(screen.getByText('Scan to join')).toBeInTheDocument();
    expect(screen.getByText('Or visit')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'pleey.example.com/join/AB12CD' })).toHaveAttribute(
      'href',
      'https://pleey.example.com/join/AB12CD',
    );
  });

  it('copies the share link when a copy action is provided', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    renderWithUiProvider(
      <QrShareCard
        copyLabel="Copy link"
        href="https://pleey.example.com/join/AB12CD"
        scanLabel="Scan to join"
        visitLabel="Or visit"
      />,
    );

    screen.getByRole('button', { name: 'Copy link' }).click();

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('https://pleey.example.com/join/AB12CD');
      expect(screen.getByRole('button', { name: '✓' })).toBeInTheDocument();
    });

    await waitForStatusReset();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument();
    });
  });

  it('shows a failure message when copying fails', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });

    renderWithUiProvider(
      <QrShareCard
        copyLabel="Copy link"
        href="https://pleey.example.com/join/AB12CD"
        scanLabel="Scan to join"
        visitLabel="Or visit"
      />,
    );

    screen.getByRole('button', { name: 'Copy link' }).click();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '✕' })).toBeInTheDocument();
    });

    await waitForStatusReset();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument();
    });
  });
});

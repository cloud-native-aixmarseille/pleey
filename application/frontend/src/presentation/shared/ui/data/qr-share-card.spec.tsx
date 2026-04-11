import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { QrShareCard } from './qr-share-card';

vi.mock('react-qr-code', async () => {
  const { ReactQrCodeMockFactory } = await import(
    'src/test-utils/mocks/react-qr-code-mock-factory'
  );

  return new ReactQrCodeMockFactory().createModule();
});

describe('QrShareCard', () => {
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
});

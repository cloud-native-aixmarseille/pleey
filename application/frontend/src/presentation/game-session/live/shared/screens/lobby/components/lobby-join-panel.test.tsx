import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../../../../test-utils/render-with-ui-provider';
import { LobbyJoinPanel } from './lobby-join-panel';

vi.mock('src/presentation/shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

vi.mock('react-qr-code', async () => {
  const { ReactQrCodeMockFactory } = await import(
    '../../../../../../../test-utils/factories/react-qr-code-mock-factory'
  );

  return new ReactQrCodeMockFactory().createModule();
});

describe('LobbyJoinPanel', () => {
  it('renders the join heading', () => {
    renderWithUiProvider(
      <LobbyJoinPanel sessionPin="AB12CD" joinUrl="http://localhost/game/join?pin=AB12CD" />,
    );

    expect(screen.getByText('game.lobby.joinHeading')).toBeInTheDocument();
  });

  it('renders the QR code with the join URL', () => {
    renderWithUiProvider(
      <LobbyJoinPanel sessionPin="AB12CD" joinUrl="http://localhost/game/join?pin=AB12CD" />,
    );

    const qrCode = screen.getByTestId('qr-code');

    expect(qrCode).toBeInTheDocument();
    expect(qrCode).toHaveTextContent('http://localhost/game/join?pin=AB12CD');
  });

  it('renders the PIN characters individually', () => {
    renderWithUiProvider(
      <LobbyJoinPanel sessionPin="AB12CD" joinUrl="http://localhost/game/join?pin=AB12CD" />,
    );

    const pinDisplay = screen.getByRole('img', { name: 'PIN: AB12CD' });

    expect(pinDisplay).toBeInTheDocument();
    expect(pinDisplay).toHaveTextContent('AB12CD');
  });

  it('renders the join URL without the protocol', () => {
    renderWithUiProvider(
      <LobbyJoinPanel sessionPin="AB12CD" joinUrl="https://pleey.app/game/join?pin=AB12CD" />,
    );

    expect(screen.getByText('pleey.app/game/join?pin=AB12CD')).toBeInTheDocument();
  });

  it('renders scan and visit instructions', () => {
    renderWithUiProvider(
      <LobbyJoinPanel sessionPin="AB12CD" joinUrl="http://localhost/game/join?pin=AB12CD" />,
    );

    expect(screen.getByText('game.lobby.scanToJoin')).toBeInTheDocument();
    expect(screen.getByText('game.lobby.orVisit')).toBeInTheDocument();
    expect(screen.getByText('game.lobby.enterCode')).toBeInTheDocument();
  });

  it('renders the visit link with the session pin query parameter', () => {
    renderWithUiProvider(
      <LobbyJoinPanel sessionPin="AB12CD" joinUrl="https://pleey.app/game/join?pin=AB12CD" />,
    );

    expect(screen.getByRole('link', { name: 'pleey.app/game/join?pin=AB12CD' })).toHaveAttribute(
      'href',
      'https://pleey.app/game/join?pin=AB12CD',
    );
  });

  it('has a labelled section role for accessibility', () => {
    renderWithUiProvider(
      <LobbyJoinPanel sessionPin="AB12CD" joinUrl="http://localhost/game/join?pin=AB12CD" />,
    );

    expect(screen.getByRole('region', { name: 'game.lobby.joinPanelLabel' })).toBeInTheDocument();
  });
});

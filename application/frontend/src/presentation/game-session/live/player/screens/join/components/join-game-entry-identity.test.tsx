import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../../../../test-utils/render-with-providers';
import { JoinGameEntryIdentity } from './join-game-entry-identity';

vi.mock('src/presentation/shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('JoinGameEntryIdentity', () => {
  it('renders the authenticated identity with the user name', () => {
    renderWithProviders(
      <JoinGameEntryIdentity isAuthenticated showGuestStep={false} userName="Morgan" />,
    );

    expect(screen.getByText('game.join.identity.authenticatedEyebrow')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Morgan/i })).toBeInTheDocument();
    expect(screen.getByText('game.join.identity.authenticatedDescription')).toBeInTheDocument();
  });

  it('renders the guest-step identity copy for unauthenticated players', () => {
    renderWithProviders(
      <JoinGameEntryIdentity isAuthenticated={false} showGuestStep userName={null} />,
    );

    expect(screen.getByText('game.join.identity.guestEyebrow')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'game.join.identity.guestTitle' }),
    ).toBeInTheDocument();
    expect(screen.getByText('game.join.identity.guestDescription')).toBeInTheDocument();
  });
});

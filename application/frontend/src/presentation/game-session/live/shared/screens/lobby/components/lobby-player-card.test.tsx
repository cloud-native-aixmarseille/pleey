import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../../../../test-utils/render-with-providers';
import { LobbyPlayerCard } from './lobby-player-card';

vi.mock('src/presentation/shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('LobbyPlayerCard', () => {
  it('renders the player name and caption', () => {
    renderWithProviders(
      <LobbyPlayerCard
        avatarUri="https://example.com/avatar.png"
        caption="You"
        name="Trinity"
        statusLabel="Ready in room"
      />,
    );

    expect(screen.getByText('Trinity')).toBeInTheDocument();
    expect(screen.getAllByText('You')).not.toHaveLength(0);
  });

  it('renders the player avatar', () => {
    renderWithProviders(
      <LobbyPlayerCard
        avatarUri="https://example.com/avatar.png"
        caption="Player"
        name="Trinity"
        statusLabel="Connected"
      />,
    );

    expect(screen.getByRole('img', { name: 'Trinity avatar' })).toHaveAttribute(
      'src',
      'https://example.com/avatar.png',
    );
  });

  it('renders the player status label', () => {
    renderWithProviders(
      <LobbyPlayerCard
        avatarUri="https://example.com/avatar.png"
        caption="Player"
        isCurrentPlayer
        name="Neo"
        statusLabel="Ready in room"
      />,
    );

    expect(screen.getAllByText('Player')).not.toHaveLength(0);
    expect(screen.getByText('Ready in room')).toBeInTheDocument();
  });
});

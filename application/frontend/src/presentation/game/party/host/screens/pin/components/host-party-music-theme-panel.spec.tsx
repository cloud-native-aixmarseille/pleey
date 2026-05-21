import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../../../../test-utils/render-with-ui-provider';
import { HostPartyMusicThemePanel } from './host-party-music-theme-panel';

vi.mock('../../../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('HostPartyMusicThemePanel', () => {
  it('renders multiple music themes and marks the selected one as playing', () => {
    renderWithUiProvider(<HostPartyMusicThemePanel />);

    expect(
      screen.getByText('game.party.host.route.musicThemes.electroPulse.name'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('game.party.host.route.musicThemes.retroArcade.name'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('game.party.host.route.musicThemes.tropicalGroove.name'),
    ).toBeInTheDocument();
    expect(screen.getByText('game.party.host.route.musicThemes.nightChill.name')).toBeInTheDocument();

    const retroArcadeThemeContainer = screen.getByTestId('host-party-music-theme-retroArcade');

    fireEvent.click(
      within(retroArcadeThemeContainer).getByRole('button', {
        name: 'game.party.host.route.musicPlayCta',
      }),
    );

    expect(screen.getByText('game.party.host.route.musicPlayingBadge')).toBeInTheDocument();
    expect(
      screen.getByText(
        'game.party.host.route.musicNowPlaying (theme=game.party.host.route.musicThemes.retroArcade.name)',
      ),
    ).toBeInTheDocument();
  });
});

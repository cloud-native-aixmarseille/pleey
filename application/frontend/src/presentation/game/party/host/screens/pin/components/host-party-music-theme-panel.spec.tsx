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
  it('plays selected theme in host browser and updates playing state', () => {
    const playSpy = vi
      .spyOn(window.HTMLMediaElement.prototype, 'play')
      .mockImplementation(async () => undefined);

    renderWithUiProvider(<HostPartyMusicThemePanel />);

    expect(screen.getByText('game.party.host.route.musicThemes.none.name')).toBeInTheDocument();
    expect(screen.getByText('game.party.host.route.musicThemes.chill.name')).toBeInTheDocument();
    expect(screen.getByText('game.party.host.route.musicThemes.funky.name')).toBeInTheDocument();
    expect(screen.getByText('game.party.host.route.musicThemes.suspense.name')).toBeInTheDocument();
    expect(screen.getByText('game.party.host.route.musicThemes.retro.name')).toBeInTheDocument();
    expect(screen.getByText('game.party.host.route.musicThemes.party.name')).toBeInTheDocument();

    const funkyThemeContainer = screen.getByTestId('host-party-music-theme-funky');

    fireEvent.click(
      within(funkyThemeContainer).getByRole('button', {
        name: 'game.party.host.route.musicPlayCta',
      }),
    );

    const audioElement = screen.getByTestId('host-party-music-audio');
    expect(audioElement).toHaveAttribute('src', '/audio/lobby/funky-v1.mp3');
    expect(playSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByText('game.party.host.route.musicPlayingBadge')).toBeInTheDocument();
    expect(
      screen.getByText(
        'game.party.host.route.musicNowPlaying (theme=game.party.host.route.musicThemes.funky.name)',
      ),
    ).toBeInTheDocument();
  });
});

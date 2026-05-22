import { fireEvent, screen, waitFor, within } from '@testing-library/react';
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
  const createDeferred = () => {
    let resolve: () => void;
    let reject: (reason?: unknown) => void;
    const promise = new Promise<void>((promiseResolve, promiseReject) => {
      resolve = promiseResolve;
      reject = promiseReject;
    });

    return {
      promise,
      reject: reject!,
      resolve: resolve!,
    };
  };

  it('plays selected theme in host browser and updates playing state', async () => {
    const playSpy = vi
      .spyOn(window.HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);

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
    await waitFor(() => {
      expect(playSpy).toHaveBeenCalledTimes(1);
      expect(screen.getByText('game.party.host.route.musicPlayingBadge')).toBeInTheDocument();
      expect(
        screen.getByText(
          'game.party.host.route.musicNowPlaying (theme=game.party.host.route.musicThemes.funky.name)',
        ),
      ).toBeInTheDocument();
    });
  });

  it('stops playback when host selects no music', async () => {
    vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const pauseSpy = vi
      .spyOn(window.HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => undefined);

    renderWithUiProvider(<HostPartyMusicThemePanel />);

    const funkyThemeContainer = screen.getByTestId('host-party-music-theme-funky');
    fireEvent.click(
      within(funkyThemeContainer).getByRole('button', {
        name: 'game.party.host.route.musicPlayCta',
      }),
    );

    await waitFor(() => {
      expect(screen.getByText('game.party.host.route.musicPlayingBadge')).toBeInTheDocument();
    });

    const audioElement = screen.getByTestId('host-party-music-audio') as HTMLAudioElement;
    audioElement.currentTime = 14;
    const noneThemeContainer = screen.getByTestId('host-party-music-theme-none');

    fireEvent.click(
      within(noneThemeContainer).getByRole('button', {
        name: 'game.party.host.route.musicPlayCta',
      }),
    );

    expect(pauseSpy).toHaveBeenCalled();
    expect(audioElement.currentTime).toBe(0);
    expect(screen.queryByText('game.party.host.route.musicPlayingBadge')).not.toBeInTheDocument();
    expect(screen.getByText('game.party.host.route.musicIdleHint')).toBeInTheDocument();
  });

  it('shows playback error when browser rejects audio playback', async () => {
    vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockRejectedValue(new Error('blocked'));
    const pauseSpy = vi
      .spyOn(window.HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => undefined);

    renderWithUiProvider(<HostPartyMusicThemePanel />);

    const suspenseThemeContainer = screen.getByTestId('host-party-music-theme-suspense');
    fireEvent.click(
      within(suspenseThemeContainer).getByRole('button', {
        name: 'game.party.host.route.musicPlayCta',
      }),
    );

    await waitFor(() => {
      expect(pauseSpy).toHaveBeenCalled();
      expect(screen.getByText('game.party.host.route.musicPlaybackError')).toBeInTheDocument();
    });

    const noneThemeContainer = screen.getByTestId('host-party-music-theme-none');
    const noneThemeButton = within(noneThemeContainer).getByRole('button');
    expect(noneThemeButton).toBeEnabled();

    fireEvent.click(noneThemeButton);
    expect(screen.queryByText('game.party.host.route.musicPlaybackError')).not.toBeInTheDocument();
    expect(screen.queryByText('game.party.host.route.musicPlayingBadge')).not.toBeInTheDocument();
  });

  it('keeps latest selected theme when previous playback resolves later', async () => {
    const firstPlayback = createDeferred();
    const secondPlayback = createDeferred();
    vi.spyOn(window.HTMLMediaElement.prototype, 'play')
      .mockImplementationOnce(async () => firstPlayback.promise)
      .mockImplementationOnce(async () => secondPlayback.promise);

    renderWithUiProvider(<HostPartyMusicThemePanel />);

    fireEvent.click(
      within(screen.getByTestId('host-party-music-theme-funky')).getByRole('button', {
        name: 'game.party.host.route.musicPlayCta',
      }),
    );
    fireEvent.click(
      within(screen.getByTestId('host-party-music-theme-party')).getByRole('button', {
        name: 'game.party.host.route.musicPlayCta',
      }),
    );

    firstPlayback.resolve();
    secondPlayback.resolve();

    await waitFor(() => {
      expect(
        screen.getByText(
          'game.party.host.route.musicNowPlaying (theme=game.party.host.route.musicThemes.party.name)',
        ),
      ).toBeInTheDocument();
    });
  });
});

import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../../../test-utils/render-with-ui-provider';
import { HostPartyMusicThemePanel } from './host-party-music-theme-panel';

vi.mock('../../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('HostPartyMusicThemePanel', () => {
  const createDeferred = () => {
    let resolvePromise: (() => void) | undefined;
    let rejectPromise: ((reason?: unknown) => void) | undefined;
    const promise = new Promise<void>((resolveFn, rejectFn) => {
      resolvePromise = resolveFn;
      rejectPromise = rejectFn;
    });

    if (!resolvePromise || !rejectPromise) {
      throw new Error('Unable to create deferred playback promise');
    }

    return {
      promise,
      reject: rejectPromise,
      resolve: resolvePromise,
    };
  };

  it('plays selected theme in host browser and updates playing state', async () => {
    const playSpy = vi
      .spyOn(window.HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);

    renderWithUiProvider(<HostPartyMusicThemePanel />);

    const themeSelect = screen.getByTestId('host-party-music-theme-select');
    expect(
      within(themeSelect).getByRole('option', {
        name: 'game.party.host.route.musicThemes.none.name',
      }),
    ).toBeInTheDocument();
    expect(
      within(themeSelect).getByRole('option', {
        name: 'game.party.host.route.musicThemes.chill.name',
      }),
    ).toBeInTheDocument();
    expect(
      within(themeSelect).getByRole('option', {
        name: 'game.party.host.route.musicThemes.funky.name',
      }),
    ).toBeInTheDocument();
    expect(
      within(themeSelect).getByRole('option', {
        name: 'game.party.host.route.musicThemes.suspense.name',
      }),
    ).toBeInTheDocument();
    expect(
      within(themeSelect).getByRole('option', {
        name: 'game.party.host.route.musicThemes.retro.name',
      }),
    ).toBeInTheDocument();
    expect(
      within(themeSelect).getByRole('option', {
        name: 'game.party.host.route.musicThemes.party.name',
      }),
    ).toBeInTheDocument();

    fireEvent.change(themeSelect, { target: { value: 'funky' } });

    const audioElement = screen.getByTestId('host-party-music-audio');
    expect(audioElement).toHaveAttribute('src', '/audio/party/funky-v1.mp3');
    await waitFor(() => {
      expect(playSpy).toHaveBeenCalledTimes(1);
      expect(themeSelect).toHaveValue('funky');
    });
  });

  it('stops playback when host selects no music', async () => {
    vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const pauseSpy = vi
      .spyOn(window.HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => undefined);

    renderWithUiProvider(<HostPartyMusicThemePanel />);

    const themeSelect = screen.getByTestId('host-party-music-theme-select');
    fireEvent.change(themeSelect, { target: { value: 'funky' } });

    const audioElement = screen.getByTestId('host-party-music-audio') as HTMLAudioElement;
    audioElement.currentTime = 14;
    fireEvent.change(themeSelect, { target: { value: 'none' } });

    expect(pauseSpy).toHaveBeenCalled();
    expect(audioElement.currentTime).toBe(0);
    expect(themeSelect).toHaveValue('none');
  });

  it('resets the selection when browser rejects audio playback', async () => {
    vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockRejectedValue(new Error('blocked'));
    const pauseSpy = vi
      .spyOn(window.HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => undefined);

    renderWithUiProvider(<HostPartyMusicThemePanel />);

    const themeSelect = screen.getByTestId('host-party-music-theme-select');
    fireEvent.change(themeSelect, { target: { value: 'suspense' } });

    await waitFor(() => {
      expect(pauseSpy).toHaveBeenCalled();
      expect(themeSelect).toHaveValue('none');
    });
  });

  it('keeps latest selected theme when previous playback settles later', async () => {
    const firstPlayback = createDeferred();
    const secondPlayback = createDeferred();
    vi.spyOn(window.HTMLMediaElement.prototype, 'play')
      .mockImplementationOnce(async () => firstPlayback.promise)
      .mockImplementationOnce(async () => secondPlayback.promise);

    renderWithUiProvider(<HostPartyMusicThemePanel />);

    const themeSelect = screen.getByTestId('host-party-music-theme-select');
    fireEvent.change(themeSelect, { target: { value: 'funky' } });
    fireEvent.change(themeSelect, { target: { value: 'party' } });

    secondPlayback.resolve();
    firstPlayback.reject(new Error('stale failure'));

    await waitFor(() => {
      expect(themeSelect).toHaveValue('party');
    });
  });
});

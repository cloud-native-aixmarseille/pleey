import { useRef, useState } from 'react';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Select } from '../../../../../shared/ui/forms/select';
import { ContentStack } from '../../../../../shared/ui/layout/containers';

interface MusicTheme {
  readonly id: 'none' | 'chill' | 'funky' | 'suspense' | 'retro' | 'party';
  readonly nameKey: string;
  readonly descriptionKey: string;
}

const hostMusicThemes: readonly MusicTheme[] = [
  {
    id: 'none',
    nameKey: 'game.party.host.route.musicThemes.none.name',
    descriptionKey: 'game.party.host.route.musicThemes.none.description',
  },
  {
    id: 'chill',
    nameKey: 'game.party.host.route.musicThemes.chill.name',
    descriptionKey: 'game.party.host.route.musicThemes.chill.description',
  },
  {
    id: 'funky',
    nameKey: 'game.party.host.route.musicThemes.funky.name',
    descriptionKey: 'game.party.host.route.musicThemes.funky.description',
  },
  {
    id: 'suspense',
    nameKey: 'game.party.host.route.musicThemes.suspense.name',
    descriptionKey: 'game.party.host.route.musicThemes.suspense.description',
  },
  {
    id: 'retro',
    nameKey: 'game.party.host.route.musicThemes.retro.name',
    descriptionKey: 'game.party.host.route.musicThemes.retro.description',
  },
  {
    id: 'party',
    nameKey: 'game.party.host.route.musicThemes.party.name',
    descriptionKey: 'game.party.host.route.musicThemes.party.description',
  },
];

function isMusicThemeId(value: string): value is MusicTheme['id'] {
  return hostMusicThemes.some((theme) => theme.id === value);
}

function useHostPartyMusicThemePlayback() {
  const [playingThemeId, setPlayingThemeId] = useState<MusicTheme['id']>('none');
  const [selectedThemeId, setSelectedThemeId] = useState<MusicTheme['id']>('none');
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const playbackRequestIdRef = useRef(0);

  const playTheme = (themeId: MusicTheme['id']) => {
    const audioElement = audioElementRef.current;

    if (!audioElement) {
      return;
    }

    const playbackRequestId = playbackRequestIdRef.current + 1;
    playbackRequestIdRef.current = playbackRequestId;
    setSelectedThemeId(themeId);

    if (themeId === 'none') {
      audioElement.pause();
      audioElement.currentTime = 0;
      setPlayingThemeId('none');
      return;
    }

    audioElement.src = `/audio/party/${themeId}-v1.mp3`;
    audioElement.loop = true;
    audioElement.currentTime = 0;

    void audioElement
      .play()
      .then(() => {
        if (playbackRequestId !== playbackRequestIdRef.current) {
          return;
        }

        setPlayingThemeId(themeId);
      })
      .catch((_playbackError) => {
        if (playbackRequestId !== playbackRequestIdRef.current) {
          return;
        }

        audioElement.pause();
        audioElement.currentTime = 0;
        setPlayingThemeId('none');
        setSelectedThemeId('none');
      });
  };

  return {
    audioElementRef,
    playTheme,
    playingThemeId,
    selectedThemeId,
  };
}

export function HostPartyMusicThemePanel() {
  const { audioElementRef, playTheme, selectedThemeId } = useHostPartyMusicThemePlayback();
  const { t } = usePresentationTranslation();

  return (
    <ContentStack gap="xs">
      <Select
        aria-label={t('game.party.host.route.musicPanelTitle')}
        data-testid="host-party-music-theme-select"
        onChange={(event) => {
          const themeId = event.currentTarget.value;

          if (!isMusicThemeId(themeId)) {
            return;
          }

          playTheme(themeId);
        }}
        value={selectedThemeId}
      >
        {hostMusicThemes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {t(theme.nameKey)}
          </option>
        ))}
      </Select>

      <audio data-testid="host-party-music-audio" ref={audioElementRef} />
    </ContentStack>
  );
}

import { useRef, useState } from 'react';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../../shared/ui/actions/button';
import { Badge } from '../../../../../../shared/ui/feedback/badge';
import { AppIcon } from '../../../../../../shared/ui/icons/app-icon';
import { AutoFillGrid, ContentStack, WrapRow } from '../../../../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../../../../shared/ui/layout/panels';
import { SectionCard } from '../../../../../../shared/ui/layout/section-card';
import { Heading, SupportingText } from '../../../../../../shared/ui/layout/typography';

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

export function HostPartyMusicThemePanel() {
  const { t } = usePresentationTranslation();
  const [playingThemeId, setPlayingThemeId] = useState<MusicTheme['id']>('none');
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const playTheme = (themeId: MusicTheme['id']) => {
    const audioElement = audioElementRef.current;

    if (!audioElement) {
      return;
    }

    if (themeId === 'none') {
      audioElement.pause();
      audioElement.currentTime = 0;
      setPlayingThemeId('none');
      return;
    }

    audioElement.src = `/audio/lobby/${themeId}-v1.mp3`;
    audioElement.loop = true;
    audioElement.currentTime = 0;
    void audioElement.play();
    setPlayingThemeId(themeId);
  };

  const playingTheme = hostMusicThemes.find((theme) => theme.id === playingThemeId) ?? null;

  return (
    <SectionCard
      description={t('game.party.host.route.musicPanelDescription')}
      footer={
        playingTheme && playingTheme.id !== 'none'
          ? t('game.party.host.route.musicNowPlaying', {
              theme: t(playingTheme.nameKey),
            })
          : t('game.party.host.route.musicIdleHint')
      }
      icon={<AppIcon name="play" size={18} />}
      title={t('game.party.host.route.musicPanelTitle')}
    >
      <AutoFillGrid gap="md" minItemWidth="14rem">
        {hostMusicThemes.map((theme) => {
          const isPlaying = theme.id === playingThemeId;

          return (
            <div data-testid={`host-party-music-theme-${theme.id}`} key={theme.id}>
              <InsetPanel tone={isPlaying ? 'accent' : 'default'}>
                <ContentStack gap="sm">
                  <WrapRow gap="sm">
                    <Heading level={3}>{t(theme.nameKey)}</Heading>
                    {isPlaying && theme.id !== 'none' ? (
                      <Badge icon={<AppIcon name="success" size={12} />} tone="live">
                        {t('game.party.host.route.musicPlayingBadge')}
                      </Badge>
                    ) : null}
                  </WrapRow>

                  <SupportingText>{t(theme.descriptionKey)}</SupportingText>

                  <Button
                    disabled={isPlaying}
                    intent={isPlaying ? 'success' : 'outline'}
                    leftSection={<AppIcon name={isPlaying ? 'success' : 'play'} size={16} />}
                    onClick={() => {
                      playTheme(theme.id);
                    }}
                    width="wide"
                  >
                    {isPlaying
                      ? t('game.party.host.route.musicPlayingCta')
                      : t('game.party.host.route.musicPlayCta')}
                  </Button>
                </ContentStack>
              </InsetPanel>
            </div>
          );
        })}
      </AutoFillGrid>

      <audio aria-hidden data-testid="host-party-music-audio" ref={audioElementRef} />
    </SectionCard>
  );
}

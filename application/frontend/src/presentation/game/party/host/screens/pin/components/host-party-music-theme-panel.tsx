import { useState } from 'react';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../../shared/ui/actions/button';
import { Badge } from '../../../../../../shared/ui/feedback/badge';
import { AppIcon } from '../../../../../../shared/ui/icons/app-icon';
import { AutoFillGrid, ContentStack, WrapRow } from '../../../../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../../../../shared/ui/layout/panels';
import { SectionCard } from '../../../../../../shared/ui/layout/section-card';
import { Heading, SupportingText } from '../../../../../../shared/ui/layout/typography';

interface MusicTheme {
  readonly id: string;
  readonly nameKey: string;
  readonly descriptionKey: string;
}

const hostMusicThemes: readonly MusicTheme[] = [
  {
    id: 'electroPulse',
    nameKey: 'game.party.host.route.musicThemes.electroPulse.name',
    descriptionKey: 'game.party.host.route.musicThemes.electroPulse.description',
  },
  {
    id: 'retroArcade',
    nameKey: 'game.party.host.route.musicThemes.retroArcade.name',
    descriptionKey: 'game.party.host.route.musicThemes.retroArcade.description',
  },
  {
    id: 'tropicalGroove',
    nameKey: 'game.party.host.route.musicThemes.tropicalGroove.name',
    descriptionKey: 'game.party.host.route.musicThemes.tropicalGroove.description',
  },
  {
    id: 'nightChill',
    nameKey: 'game.party.host.route.musicThemes.nightChill.name',
    descriptionKey: 'game.party.host.route.musicThemes.nightChill.description',
  },
];

export function HostPartyMusicThemePanel() {
  const { t } = usePresentationTranslation();
  const [playingThemeId, setPlayingThemeId] = useState<string | null>(null);
  const playingTheme = hostMusicThemes.find((theme) => theme.id === playingThemeId) ?? null;

  return (
    <SectionCard
      description={t('game.party.host.route.musicPanelDescription')}
      footer={
        playingTheme
          ? t('game.party.host.route.musicNowPlaying', {
              theme: String(t(playingTheme.nameKey)),
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
            <InsetPanel key={theme.id} tone={isPlaying ? 'accent' : 'default'}>
              <ContentStack gap="sm">
                <WrapRow gap="sm">
                  <Heading level={3}>{t(theme.nameKey)}</Heading>
                  {isPlaying ? (
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
                    setPlayingThemeId(theme.id);
                  }}
                  width="wide"
                >
                  {isPlaying
                    ? t('game.party.host.route.musicPlayingCta')
                    : t('game.party.host.route.musicPlayCta')}
                </Button>
              </ContentStack>
            </InsetPanel>
          );
        })}
      </AutoFillGrid>
    </SectionCard>
  );
}

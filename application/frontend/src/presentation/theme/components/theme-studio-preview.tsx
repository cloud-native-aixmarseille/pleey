import { useState } from 'react';
import type { ThemeDocument } from '../../../domains/theme/entities/theme-document';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { Button } from '../../shared/ui/actions/button';
import { AppIcon } from '../../shared/ui/icons/app-icon';
import { ActionRow, ContentStack, SplitWrapRow } from '../../shared/ui/layout/containers';
import { ElevatedPanel } from '../../shared/ui/layout/panels';
import { SummaryText, SupportingText } from '../../shared/ui/layout/typography';
import { usePresentationMediaQuery } from '../../shared/ui/layout/use-presentation-media-query';
import { PresentationThemePreview, usePresentationThemeState } from '../../shared/ui/provider';
import { ThemeBrandSurface } from './theme-brand-surface';
import { ThemePreviewScenes } from './theme-preview-scenes';

export function ThemeStudioPreview({
  document,
  invalid,
}: {
  readonly document: ThemeDocument;
  readonly invalid: boolean;
}) {
  const { t } = usePresentationTranslation();
  const { activeColorScheme } = usePresentationThemeState();
  const [scheme, setScheme] = useState(activeColorScheme);
  const [device, setDevice] = useState<'desktop' | 'phone'>('desktop');
  const [scene, setScene] = useState<'lobby' | 'question' | 'results' | 'checks'>('question');
  const mobile = usePresentationMediaQuery();
  return (
    <section className="theme-studio-stage" aria-label={t('theme.studio.livePreview')}>
      <ContentStack gap="lg">
        <SplitWrapRow>
          <SummaryText>{t('theme.studio.livePreview')}</SummaryText>
          <ActionRow>
            <div role="group" aria-label={t('theme.studio.previewDevice')}>
              <ActionRow gap="xs">
                {(['desktop', 'phone'] as const).map((value) => (
                  <Button
                    key={value}
                    size="sm"
                    intent={device === value ? 'secondary' : 'ghost'}
                    aria-pressed={device === value}
                    aria-label={t(`theme.studio.devices.${value}`)}
                    onClick={() => setDevice(value)}
                  >
                    <AppIcon name={value} size={18} />
                  </Button>
                ))}
              </ActionRow>
            </div>
            <div role="group" aria-label={t('theme.studio.previewScheme')}>
              <ActionRow gap="xs">
                {(['light', 'dark'] as const).map((value) => (
                  <Button
                    key={value}
                    size="sm"
                    intent={scheme === value ? 'secondary' : 'ghost'}
                    aria-pressed={scheme === value}
                    onClick={() => setScheme(value)}
                  >
                    {t(`theme.studio.schemes.${value}`)}
                  </Button>
                ))}
              </ActionRow>
            </div>
          </ActionRow>
        </SplitWrapRow>
        <SplitWrapRow gap="sm">
          <SupportingText>{t('theme.studio.playerExperience')}</SupportingText>
          <div role="status">
            <SupportingText>{t(invalid ? 'theme.studio.lastValid' : 'theme.studio.updatesLive')}</SupportingText>
          </div>
        </SplitWrapRow>
        <div className="theme-studio-preview-frame" data-device={device}>
          <PresentationThemePreview document={document} colorScheme={scheme}>
            <ElevatedPanel>
              <ThemeBrandSurface>
                <ContentStack gap="xl">
                  <SplitWrapRow gap="sm">
                    <ActionRow gap="sm">
                      <AppIcon name="feature" size={26} />
                      <SummaryText>{document.name}</SummaryText>
                    </ActionRow>
                    <SupportingText>{t('theme.studio.preview.playersOnline')}</SupportingText>
                  </SplitWrapRow>
                  <ThemePreviewScenes scene={scene} phone={device === 'phone' || mobile} />
                  <SupportingText>{t('theme.studio.preview.sample')}</SupportingText>
                </ContentStack>
              </ThemeBrandSurface>
            </ElevatedPanel>
          </PresentationThemePreview>
        </div>
        <nav aria-label={t('theme.studio.previewScene')}>
          <ActionRow justify="center" gap="xs">
            {(['lobby', 'question', 'results', 'checks'] as const).map((value) => (
              <Button
                key={value}
                size="sm"
                intent={scene === value ? 'secondary' : 'ghost'}
                aria-pressed={scene === value}
                onClick={() => setScene(value)}
              >
                {t(`theme.studio.scenes.${value}`)}
              </Button>
            ))}
          </ActionRow>
        </nav>
        <SupportingText>{t('theme.studio.previewHelp')}</SupportingText>
      </ContentStack>
    </section>
  );
}

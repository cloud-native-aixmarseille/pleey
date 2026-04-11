import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { AppIcon } from '../../../shared/ui/icons/app-icon';
import { ContentStack } from '../../../shared/ui/layout/containers';
import { IntroBlock } from '../../../shared/ui/layout/intro-block';
import { LandingHeroLogo, LandingHeroSurface } from '../../../shared/ui/layout/landing-sections';
import { PrimaryActionLink } from '../../../shared/ui/navigation/links';

export function HomeHeroSection() {
  const { t } = usePresentationTranslation();

  return (
    <LandingHeroSurface ariaLabel={t('home.hero.eyebrow')}>
      <ContentStack align="center" gap="md">
        <LandingHeroLogo />
        <IntroBlock
          align="center"
          eyebrow={t('home.hero.eyebrow')}
          hero
          level={1}
          subtitle={t('home.hero.tagline')}
          subtitleMaxWidth="35rem"
          subtitleSize="md"
          title={t('home.hero.title')}
        />
        <ContentStack align="center" gap="sm" marginTop="sm">
          <PrimaryActionLink
            leftSection={<AppIcon name="dashboard" size={16} />}
            to="/workspace/dashboard"
          >
            {t('home.hero.primaryCta')}
          </PrimaryActionLink>
        </ContentStack>
      </ContentStack>
    </LandingHeroSurface>
  );
}

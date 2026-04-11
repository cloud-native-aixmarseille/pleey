import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { AppIcon } from '../../../shared/ui/icons/app-icon';
import { ContentStack } from '../../../shared/ui/layout/containers';
import { IntroBlock } from '../../../shared/ui/layout/intro-block';
import { LandingCalloutSurface } from '../../../shared/ui/layout/landing-sections';
import { PrimaryActionLink } from '../../../shared/ui/navigation/links';

export function HomeClosingCtaSection() {
  const { t } = usePresentationTranslation();

  return (
    <LandingCalloutSurface>
      <IntroBlock
        align="center"
        subtitle={t('home.closingCta.description')}
        subtitleMaxWidth="38rem"
        title={t('home.closingCta.heading')}
      />
      <ContentStack align="center" gap="sm">
        <PrimaryActionLink
          leftSection={<AppIcon name="register" size={16} />}
          to="/identity/register"
        >
          {t('home.closingCta.primaryCta')}
        </PrimaryActionLink>
      </ContentStack>
    </LandingCalloutSurface>
  );
}

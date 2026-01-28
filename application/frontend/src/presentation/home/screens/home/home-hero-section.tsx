import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { useGameSessionRoutes } from '../../../shared/routing/game-session-route-context';
import { PleeyLogo } from '../../../shared/ui/branding/pleey-logo';
import { AppIcon } from '../../../shared/ui/icons/app-icon';
import { IntroBlock } from '../../../shared/ui/layout/intro-block';
import { PrimaryActionLink, SecondaryActionLink } from '../../../shared/ui/navigation/links';
import { heroActionsStyle, heroContentStyle, heroLogoStyle, heroStyle } from './home-screen-styles';

export function HomeHeroSection() {
  const { t } = usePresentationTranslation();
  const { resolveJoinRoute } = useGameSessionRoutes();
  const gameJoinRoute = resolveJoinRoute();

  return (
    <section aria-label={t('home.hero.eyebrow')} style={heroStyle}>
      <div style={heroContentStyle}>
        <PleeyLogo size="xl" style={heroLogoStyle} />
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
        <div style={heroActionsStyle}>
          <PrimaryActionLink
            leftSection={<AppIcon name="dashboard" size={16} />}
            to="/workspace/dashboard"
          >
            {t('home.hero.primaryCta')}
          </PrimaryActionLink>
          <SecondaryActionLink leftSection={<AppIcon name="game" size={16} />} to={gameJoinRoute}>
            {t('home.hero.secondaryCta')}
          </SecondaryActionLink>
        </div>
      </div>
    </section>
  );
}

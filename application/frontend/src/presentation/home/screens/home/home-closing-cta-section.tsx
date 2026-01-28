import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { useGameSessionRoutes } from '../../../shared/routing/game-session-route-context';
import { AppIcon } from '../../../shared/ui/icons/app-icon';
import { IntroBlock } from '../../../shared/ui/layout/intro-block';
import { PrimaryActionLink, SecondaryActionLink } from '../../../shared/ui/navigation/links';
import { closingStyle, heroActionsStyle } from './home-screen-styles';

export function HomeClosingCtaSection() {
  const { t } = usePresentationTranslation();
  const { resolveJoinRoute } = useGameSessionRoutes();
  const gameJoinRoute = resolveJoinRoute();

  return (
    <section style={closingStyle}>
      <IntroBlock
        align="center"
        subtitle={t('home.closingCta.description')}
        subtitleMaxWidth="38rem"
        title={t('home.closingCta.heading')}
      />
      <div style={heroActionsStyle}>
        <PrimaryActionLink
          leftSection={<AppIcon name="register" size={16} />}
          to="/identity/register"
        >
          {t('home.closingCta.primaryCta')}
        </PrimaryActionLink>
        <SecondaryActionLink leftSection={<AppIcon name="game" size={16} />} to={gameJoinRoute}>
          {t('home.closingCta.secondaryCta')}
        </SecondaryActionLink>
      </div>
    </section>
  );
}

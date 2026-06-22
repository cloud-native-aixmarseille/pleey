import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { AppIcon } from '../../../shared/ui/icons/app-icon';
import { PrimaryActionLink, SecondaryActionLink } from '../../../shared/ui/navigation/links';
import {
  actionsStyle,
  cardStyle,
  codeStyle,
  descStyle,
  iconStyle,
  rootStyle,
  titleStyle,
} from './not-found-screen.styles';

export function NotFoundScreen() {
  const { t } = usePresentationTranslation();
  return (
    <div style={rootStyle}>
      <div style={cardStyle}>
        <span style={iconStyle}>
          <AppIcon name="not-found" size={28} />
        </span>
        <p aria-hidden style={codeStyle}>
          {t('notFound.code')}
        </p>
        <h2 style={titleStyle}>{t('notFound.title')}</h2>
        <p style={descStyle}>{t('notFound.description')}</p>
        <nav aria-label={t('notFound.title')} style={actionsStyle}>
          <PrimaryActionLink leftSection={<AppIcon name="dashboard" size={16} />} to="/">
            {t('notFound.homeCta')}
          </PrimaryActionLink>
          <SecondaryActionLink
            leftSection={<AppIcon name="dashboard" size={16} />}
            to="/workspace/dashboard"
          >
            {t('notFound.dashboardCta')}
          </SecondaryActionLink>
        </nav>
      </div>
    </div>
  );
}

import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';
import { surfaceRecipes } from '../../../shared/ui/foundation/ui-recipes';
import { uiThemeTokens } from '../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../shared/ui/foundation/ui-typography';
import { AppIcon } from '../../../shared/ui/icons/app-icon';
import { PrimaryActionLink, SecondaryActionLink } from '../../../shared/ui/navigation/links';

const rootStyle = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  minHeight: '50vh',
  padding: uiThemeTokens.spacing.lg,
} as const;

const cardStyle = {
  ...surfaceRecipes.elevated,
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.md,
  maxWidth: '28rem',
  padding: uiThemeTokens.spacing.xl,
  textAlign: 'center',
  width: '100%',
} as const;

const iconStyle = {
  color: uiThemeTokens.color.brand.primary,
  display: 'inline-flex',
} as const;

const codeStyle = {
  ...uiTypeScale.mono,
  color: uiThemeTokens.color.brand.primary,
  fontSize: 'clamp(4rem, 8vw, 6rem)',
  fontWeight: 700,
  lineHeight: 1,
  margin: 0,
  opacity: 0.7,
} as const;

const titleStyle = {
  ...uiTypeScale.pageTitle,
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
} as const;

const descStyle = {
  ...uiTypeScale.bodySmall,
  color: uiThemeTokens.color.text.quiet,
  margin: 0,
} as const;

const actionsStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: uiThemeTokens.spacing.sm,
  justifyContent: 'center',
} as const;

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

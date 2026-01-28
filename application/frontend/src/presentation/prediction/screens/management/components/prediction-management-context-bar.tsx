import { formatLocalizedDate } from '../../../../shared/i18n/format-localized-date';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import { surfaceRecipes } from '../../../../shared/ui/foundation/ui-recipes';
import { uiThemeTokens } from '../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../shared/ui/foundation/ui-typography';
import { AppIcon } from '../../../../shared/ui/icons/app-icon';

interface PredictionManagementContextBarProps {
  readonly predictionTitle: string;
  readonly promptCount: number;
  readonly createdAt: string;
}

const barStyle = {
  ...surfaceRecipes.elevated,
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: uiThemeTokens.spacing.md,
  padding: `${uiThemeTokens.spacing.sm} ${uiThemeTokens.spacing.lg}`,
} as const;

const titleGroupStyle = {
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  gap: uiThemeTokens.spacing.sm,
  minWidth: 0,
} as const;

const iconStyle = {
  color: uiThemeTokens.color.brand.accent,
  display: 'inline-flex',
  flexShrink: 0,
} as const;

const titleStyle = {
  ...uiTypeScale.label,
  color: uiThemeTokens.color.text.primary,
  margin: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

const metaGroupStyle = {
  alignItems: 'center',
  display: 'flex',
  flexShrink: 0,
  gap: uiThemeTokens.spacing.md,
} as const;

const metaStyle = {
  ...uiTypeScale.caption,
  color: uiThemeTokens.color.text.soft,
  margin: 0,
  whiteSpace: 'nowrap',
} as const;

export function PredictionManagementContextBar({
  predictionTitle,
  promptCount,
  createdAt,
}: PredictionManagementContextBarProps) {
  const { currentLanguage, t } = usePresentationTranslation();

  const formattedDate = formatLocalizedDate(createdAt, {
    locale: currentLanguage,
    dateStyle: 'medium',
  });

  return (
    <div style={barStyle} role="banner" aria-label={t('prediction.management.contextBarLabel')}>
      <div style={titleGroupStyle}>
        <span style={iconStyle}>
          <AppIcon name="prediction" size={18} />
        </span>
        <p style={titleStyle}>{predictionTitle}</p>
      </div>

      <div style={metaGroupStyle}>
        <p style={metaStyle}>
          {t('prediction.management.promptSummary', { count: String(promptCount) })}
        </p>
        <p style={metaStyle}>{t('prediction.management.createdAt', { date: formattedDate })}</p>
      </div>
    </div>
  );
}

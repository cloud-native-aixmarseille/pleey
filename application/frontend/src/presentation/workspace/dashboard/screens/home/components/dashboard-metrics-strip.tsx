import type { OrganizationDashboard } from '../../../../../../domains/organization/entities/organization-dashboard';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { surfaceRecipes } from '../../../../../shared/ui/foundation/ui-recipes';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../../shared/ui/foundation/ui-typography';

interface DashboardMetricsStripProps {
  readonly dashboard: OrganizationDashboard | null;
}

const stripStyle = {
  ...surfaceRecipes.inset,
  display: 'grid',
  gap: uiThemeTokens.spacing.xs,
  gridTemplateColumns: 'repeat(auto-fit, minmax(7rem, 1fr))',
  padding: uiThemeTokens.spacing.md,
} as const;

const metricCellStyle = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.xxs,
  padding: `${uiThemeTokens.spacing.xs} 0`,
} as const;

const metricValueStyle = {
  ...uiTypeScale.sectionTitle,
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
} as const;

const metricLabelStyle = {
  ...uiTypeScale.caption,
  color: uiThemeTokens.color.text.soft,
  margin: 0,
  textAlign: 'center',
} as const;

const emptyStyle = {
  ...uiTypeScale.bodySmall,
  color: uiThemeTokens.color.text.quiet,
  margin: 0,
  padding: `${uiThemeTokens.spacing.sm} 0`,
  textAlign: 'center',
} as const;

interface MetricCellProps {
  readonly label: string;
  readonly value: number;
}

function MetricCell({ label, value }: MetricCellProps) {
  return (
    <div style={metricCellStyle}>
      <p style={metricValueStyle}>{String(value)}</p>
      <p style={metricLabelStyle}>{label}</p>
    </div>
  );
}

export function DashboardMetricsStrip({ dashboard }: DashboardMetricsStripProps) {
  const { t } = usePresentationTranslation();

  if (!dashboard) {
    return (
      <div style={stripStyle}>
        <p style={emptyStyle}>{t('dashboard.stats.empty')}</p>
      </div>
    );
  }

  return (
    <div style={stripStyle} role="region" aria-label={t('dashboard.stats.title')}>
      <MetricCell label={t('dashboard.stats.totalGames')} value={dashboard.stats.totalGames} />
      <MetricCell
        label={t('dashboard.stats.totalProjects')}
        value={dashboard.stats.totalProjects}
      />
      <MetricCell label={t('dashboard.stats.totalMembers')} value={dashboard.stats.totalMembers} />
      <MetricCell
        label={t('dashboard.stats.activeGameSessions')}
        value={dashboard.stats.activeGameSessions}
      />
      <MetricCell
        label={t('dashboard.stats.totalGameSessions')}
        value={dashboard.stats.totalGameSessions}
      />
    </div>
  );
}

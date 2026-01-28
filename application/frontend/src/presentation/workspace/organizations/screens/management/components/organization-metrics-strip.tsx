import type { OrganizationDashboard } from '../../../../../../domains/organization/entities/organization-dashboard';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { surfaceRecipes } from '../../../../../shared/ui/foundation/ui-recipes';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../../shared/ui/foundation/ui-typography';

interface OrganizationMetricsStripProps {
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

export function OrganizationMetricsStrip({ dashboard }: OrganizationMetricsStripProps) {
  const { t } = usePresentationTranslation();

  if (!dashboard) {
    return (
      <div style={stripStyle}>
        <p style={emptyStyle}>{t('organization.management.statsEmpty')}</p>
      </div>
    );
  }

  return (
    <div style={stripStyle} role="region" aria-label={t('organization.management.statsTitle')}>
      <MetricCell
        label={t('organization.management.statsTotalGames')}
        value={dashboard.stats.totalGames}
      />
      <MetricCell
        label={t('organization.management.statsTotalProjects')}
        value={dashboard.stats.totalProjects}
      />
      <MetricCell
        label={t('organization.management.statsTotalMembers')}
        value={dashboard.stats.totalMembers}
      />
      <MetricCell
        label={t('organization.management.statsActiveSessions')}
        value={dashboard.stats.activeGameSessions}
      />
      <MetricCell
        label={t('organization.management.statsTotalSessions')}
        value={dashboard.stats.totalGameSessions}
      />
    </div>
  );
}

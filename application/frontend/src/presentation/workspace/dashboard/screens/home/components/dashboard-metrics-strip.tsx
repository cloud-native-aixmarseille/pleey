import type { OrganizationDashboard } from '../../../../../../domains/organization/entities/organization-dashboard';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { ResponsiveGrid } from '../../../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../../../shared/ui/layout/panels';
import { SupportingText } from '../../../../../shared/ui/layout/typography';
import { WorkspaceMetricCell } from '../../../../shared/components/workspace-metric-cell';

interface DashboardMetricsStripProps {
  readonly dashboard: OrganizationDashboard | null;
}

export function DashboardMetricsStrip({ dashboard }: DashboardMetricsStripProps) {
  const { t } = usePresentationTranslation();

  if (!dashboard) {
    return (
      <InsetPanel>
        <SupportingText>{t('dashboard.stats.empty')}</SupportingText>
      </InsetPanel>
    );
  }

  return (
    <div role="region" aria-label={t('dashboard.stats.title')}>
      <InsetPanel>
        <ResponsiveGrid columns={{ base: 1, sm: 3 }} gap="sm">
          <WorkspaceMetricCell
            label={t('dashboard.stats.totalGames')}
            value={dashboard.stats.totalGames}
          />
          <WorkspaceMetricCell
            label={t('dashboard.stats.totalProjects')}
            value={dashboard.stats.totalProjects}
          />
          <WorkspaceMetricCell
            label={t('dashboard.stats.totalMembers')}
            value={dashboard.stats.totalMembers}
          />
        </ResponsiveGrid>
      </InsetPanel>
    </div>
  );
}

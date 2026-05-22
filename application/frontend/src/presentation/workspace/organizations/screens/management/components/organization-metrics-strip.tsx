import type { OrganizationDashboard } from '../../../../../../domains/organization/entities/organization-dashboard';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { ResponsiveGrid } from '../../../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../../../shared/ui/layout/panels';
import { SupportingText } from '../../../../../shared/ui/layout/typography';
import { WorkspaceMetricCell } from '../../../../shared/components/workspace-metric-cell';

interface OrganizationMetricsStripProps {
  readonly dashboard: OrganizationDashboard | null;
}

export function OrganizationMetricsStrip({ dashboard }: OrganizationMetricsStripProps) {
  const { t } = usePresentationTranslation();

  if (!dashboard) {
    return (
      <InsetPanel>
        <SupportingText>{t('organization.management.stats.empty')}</SupportingText>
      </InsetPanel>
    );
  }

  return (
    <div role="region" aria-label={t('organization.management.stats.title')}>
      <InsetPanel>
        <ResponsiveGrid columns={{ base: 1, sm: 3 }} gap="sm">
          <WorkspaceMetricCell
            label={t('organization.management.stats.totalGames')}
            value={dashboard.stats.totalGames}
          />
          <WorkspaceMetricCell
            label={t('organization.management.stats.totalProjects')}
            value={dashboard.stats.totalProjects}
          />
          <WorkspaceMetricCell
            label={t('organization.management.stats.totalMembers')}
            value={dashboard.stats.totalMembers}
          />
        </ResponsiveGrid>
      </InsetPanel>
    </div>
  );
}

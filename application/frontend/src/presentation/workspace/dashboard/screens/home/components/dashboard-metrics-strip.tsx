import type { OrganizationDashboard } from '../../../../../../domains/organization/entities/organization-dashboard';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { ContentStack, ResponsiveGrid } from '../../../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../../../shared/ui/layout/panels';
import { SummaryText, SupportingText } from '../../../../../shared/ui/layout/typography';

interface DashboardMetricsStripProps {
  readonly dashboard: OrganizationDashboard | null;
}

interface MetricCellProps {
  readonly label: string;
  readonly value: number;
}

function MetricCell({ label, value }: MetricCellProps) {
  return (
    <ContentStack align="center" gap="xs">
      <SummaryText>{String(value)}</SummaryText>
      <SupportingText>{label}</SupportingText>
    </ContentStack>
  );
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
          <MetricCell label={t('dashboard.stats.totalGames')} value={dashboard.stats.totalGames} />
          <MetricCell
            label={t('dashboard.stats.totalProjects')}
            value={dashboard.stats.totalProjects}
          />
          <MetricCell
            label={t('dashboard.stats.totalMembers')}
            value={dashboard.stats.totalMembers}
          />
        </ResponsiveGrid>
      </InsetPanel>
    </div>
  );
}

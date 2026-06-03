import type {
  Organization,
  OrganizationId,
} from '../../../../../../domains/organization/entities/organization';
import type { OrganizationDashboard } from '../../../../../../domains/organization/entities/organization-dashboard';
import type { Project, ProjectId } from '../../../../../../domains/project/entities/project';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { ContentStack } from '../../../../../shared/ui/layout/containers';
import { ElevatedPanel } from '../../../../../shared/ui/layout/panels';
import { Heading, SupportingText } from '../../../../../shared/ui/layout/typography';
import { DashboardMetricsStrip } from './dashboard-metrics-strip';
import { DashboardWorkspaceSelectors } from './dashboard-workspace-selectors';

interface DashboardCommandBarProps {
  readonly organizations: readonly Organization[];
  readonly hasMoreOrganizations: boolean;
  readonly projects: readonly Project[];
  readonly organizationId: OrganizationId | null;
  readonly selectedOrganizationLabel?: string | null;
  readonly projectId: ProjectId | null;
  readonly selectedProjectLabel?: string | null;
  readonly hasMoreProjects: boolean;
  readonly isOrganizationsLoading: boolean;
  readonly isLoadingMoreOrganizations: boolean;
  readonly isWorkspaceLoading: boolean;
  readonly isLoadingMoreProjects: boolean;
  readonly onOrganizationChange: (value: string) => void;
  readonly onOrganizationSearchChange: (value: string) => void;
  readonly onLoadMoreOrganizations: () => void;
  readonly onProjectChange: (value: string) => void;
  readonly onProjectSearchChange: (value: string) => void;
  readonly onLoadMoreProjects: () => void;
  readonly onManageOrganizations: () => void;
  readonly onManageProjects: () => void;
  readonly dashboard: OrganizationDashboard | null;
}

export function DashboardCommandBar({
  organizations,
  hasMoreOrganizations,
  projects,
  organizationId,
  selectedOrganizationLabel,
  projectId,
  selectedProjectLabel,
  hasMoreProjects,
  isOrganizationsLoading,
  isLoadingMoreOrganizations,
  isWorkspaceLoading,
  isLoadingMoreProjects,
  onOrganizationChange,
  onOrganizationSearchChange,
  onLoadMoreOrganizations,
  onProjectChange,
  onProjectSearchChange,
  onLoadMoreProjects,
  onManageOrganizations,
  onManageProjects,
  dashboard,
}: DashboardCommandBarProps) {
  const { t } = usePresentationTranslation();

  return (
    <div role="toolbar" aria-label={t('dashboard.workspace.sectionTitle')}>
      <ElevatedPanel padding="lg">
        <ContentStack gap="md">
          <ContentStack gap="xs">
            <Heading level={1}>{t('dashboard.console.title')}</Heading>
            <SupportingText>{t('dashboard.console.subtitle')}</SupportingText>
          </ContentStack>
          <DashboardWorkspaceSelectors
            hasMoreOrganizations={hasMoreOrganizations}
            hasMoreProjects={hasMoreProjects}
            isOrganizationsLoading={isOrganizationsLoading}
            isLoadingMoreOrganizations={isLoadingMoreOrganizations}
            isLoadingMoreProjects={isLoadingMoreProjects}
            isWorkspaceLoading={isWorkspaceLoading}
            manageOrganizationsLabel={t('dashboard.workspace.manageOrganizations')}
            manageProjectsLabel={t('dashboard.workspace.manageProjects')}
            onManageOrganizations={onManageOrganizations}
            onManageProjects={onManageProjects}
            onOrganizationChange={onOrganizationChange}
            onOrganizationSearchChange={onOrganizationSearchChange}
            onLoadMoreOrganizations={onLoadMoreOrganizations}
            onProjectChange={onProjectChange}
            onProjectSearchChange={onProjectSearchChange}
            onLoadMoreProjects={onLoadMoreProjects}
            organizationEmptyLabel={t('dashboard.workspace.organizationEmpty')}
            organizationId={organizationId}
            organizationLabel={t('dashboard.workspace.organizationLabel')}
            organizationLoadingLabel={t('dashboard.workspace.organizationLoading')}
            organizationNoResultsLabel={t('dashboard.workspace.organizationNoResults')}
            organizationPlaceholder={t('dashboard.workspace.organizationPlaceholder')}
            organizationSearchLabel={t('dashboard.workspace.organizationSearchLabel')}
            organizationSearchPlaceholder={t('dashboard.workspace.organizationSearchPlaceholder')}
            organizations={organizations}
            selectedOrganizationLabel={selectedOrganizationLabel}
            projectEmptyLabel={t('dashboard.workspace.projectEmpty')}
            projectId={projectId}
            projectLabel={t('dashboard.workspace.projectLabel')}
            projectLoadingLabel={t('dashboard.workspace.projectLoading')}
            projectNoResultsLabel={t('dashboard.workspace.projectNoResults')}
            projectPlaceholder={t('dashboard.workspace.projectPlaceholder')}
            projectSearchLabel={t('dashboard.workspace.projectSearchLabel')}
            projectSearchPlaceholder={t('dashboard.workspace.projectSearchPlaceholder')}
            projects={projects}
            selectedProjectLabel={selectedProjectLabel}
          />

          {dashboard ? <DashboardMetricsStrip dashboard={dashboard} /> : null}
        </ContentStack>
      </ElevatedPanel>
    </div>
  );
}

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
  readonly projects: readonly Project[];
  readonly organizationId: OrganizationId | null;
  readonly projectId: ProjectId | null;
  readonly isOrganizationsLoading: boolean;
  readonly isWorkspaceLoading: boolean;
  readonly onOrganizationChange: (value: string) => void;
  readonly onProjectChange: (value: string) => void;
  readonly onManageOrganizations: () => void;
  readonly onManageProjects: () => void;
  readonly dashboard: OrganizationDashboard | null;
}

export function DashboardCommandBar({
  organizations,
  projects,
  organizationId,
  projectId,
  isOrganizationsLoading,
  isWorkspaceLoading,
  onOrganizationChange,
  onProjectChange,
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
            isOrganizationsLoading={isOrganizationsLoading}
            isWorkspaceLoading={isWorkspaceLoading}
            manageOrganizationsLabel={t('dashboard.workspace.manageOrganizations')}
            manageProjectsLabel={t('dashboard.workspace.manageProjects')}
            onManageOrganizations={onManageOrganizations}
            onManageProjects={onManageProjects}
            onOrganizationChange={onOrganizationChange}
            onProjectChange={onProjectChange}
            organizationId={organizationId}
            organizationLabel={t('dashboard.workspace.organizationLabel')}
            organizationPlaceholder={t('dashboard.workspace.organizationPlaceholder')}
            organizations={organizations}
            projectId={projectId}
            projectLabel={t('dashboard.workspace.projectLabel')}
            projectPlaceholder={t('dashboard.workspace.projectPlaceholder')}
            projects={projects}
          />

          {dashboard ? <DashboardMetricsStrip dashboard={dashboard} /> : null}
        </ContentStack>
      </ElevatedPanel>
    </div>
  );
}

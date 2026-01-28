import type { Organization } from '../../../../../../domains/organization/entities/organization';
import type { OrganizationDashboard } from '../../../../../../domains/organization/entities/organization-dashboard';
import type { Project } from '../../../../../../domains/project/entities/project';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { surfaceRecipes } from '../../../../../shared/ui/foundation/ui-recipes';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import { DashboardMetricsStrip } from './dashboard-metrics-strip';
import { DashboardWorkspaceSelectors } from './dashboard-workspace-selectors';

interface DashboardCommandBarProps {
  readonly organizations: readonly Organization[];
  readonly projects: readonly Project[];
  readonly organizationId: number | null;
  readonly projectId: number | null;
  readonly isOrganizationsLoading: boolean;
  readonly isWorkspaceLoading: boolean;
  readonly onOrganizationChange: (value: string) => void;
  readonly onProjectChange: (value: string) => void;
  readonly onManageOrganizations: () => void;
  readonly onManageProjects: () => void;
  readonly dashboard: OrganizationDashboard | null;
}

/* ── Surface ── */

const barStyle = {
  ...surfaceRecipes.elevated,
  display: 'grid',
  gap: 0,
  overflow: 'hidden',
} as const;

const accentLineStyle = {
  background: `linear-gradient(90deg, ${uiThemeTokens.color.brand.primary}, ${uiThemeTokens.color.brand.accent})`,
  height: '2px',
} as const;

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
    <div style={barStyle} role="toolbar" aria-label={t('dashboard.workspace.sectionTitle')}>
      <div style={accentLineStyle} aria-hidden />

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
    </div>
  );
}

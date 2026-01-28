import type { Organization } from '../../../../../../domains/organization/entities/organization';
import type { Project } from '../../../../../../domains/project/entities/project';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Select } from '../../../../../shared/ui/forms/select';
import { surfaceRecipes } from '../../../../../shared/ui/foundation/ui-recipes';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../../shared/ui/foundation/ui-typography';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';

interface DashboardWorkspaceBarProps {
  readonly organizations: readonly Organization[];
  readonly projects: readonly Project[];
  readonly organizationId: number | null;
  readonly projectId: number | null;
  readonly selectedOrganizationName: string | null;
  readonly selectedProjectName: string | null;
  readonly isOrganizationsLoading: boolean;
  readonly isWorkspaceLoading: boolean;
  readonly onOrganizationChange: (value: string) => void;
  readonly onProjectChange: (value: string) => void;
}

const barStyle = {
  ...surfaceRecipes.elevated,
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: uiThemeTokens.spacing.md,
  padding: `${uiThemeTokens.spacing.sm} ${uiThemeTokens.spacing.lg}`,
} as const;

const selectorGroupStyle = {
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexWrap: 'wrap',
  gap: uiThemeTokens.spacing.sm,
  minWidth: 0,
} as const;

const selectWrapperStyle = {
  flex: '1 1 12rem',
  minWidth: 0,
} as const;

const readyLabelStyle = {
  ...uiTypeScale.caption,
  alignItems: 'center',
  color: uiThemeTokens.color.text.soft,
  display: 'flex',
  gap: uiThemeTokens.spacing.xxs,
  margin: 0,
  whiteSpace: 'nowrap',
} as const;

const readyIconStyle = {
  color: uiThemeTokens.color.brand.success,
  display: 'inline-flex',
  flexShrink: 0,
} as const;

export function DashboardWorkspaceBar({
  organizations,
  projects,
  organizationId,
  projectId,
  selectedOrganizationName,
  selectedProjectName,
  isOrganizationsLoading,
  isWorkspaceLoading,
  onOrganizationChange,
  onProjectChange,
}: DashboardWorkspaceBarProps) {
  const { t } = usePresentationTranslation();
  const isReady = selectedOrganizationName !== null && selectedProjectName !== null;

  return (
    <div style={barStyle} role="toolbar" aria-label={t('dashboard.workspace.sectionTitle')}>
      <div style={selectorGroupStyle}>
        <div style={selectWrapperStyle}>
          <label htmlFor="dashboard-organization-select">
            <Select
              aria-label={t('dashboard.workspace.organizationLabel')}
              disabled={isOrganizationsLoading}
              id="dashboard-organization-select"
              onChange={(event) => onOrganizationChange(event.currentTarget.value)}
              value={organizationId === null ? '' : String(organizationId)}
            >
              <option value="">{t('dashboard.workspace.organizationPlaceholder')}</option>
              {organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </Select>
          </label>
        </div>

        <div style={selectWrapperStyle}>
          <label htmlFor="dashboard-project-select">
            <Select
              aria-label={t('dashboard.workspace.projectLabel')}
              disabled={organizationId === null || isWorkspaceLoading}
              id="dashboard-project-select"
              onChange={(event) => onProjectChange(event.currentTarget.value)}
              value={projectId === null ? '' : String(projectId)}
            >
              <option value="">{t('dashboard.workspace.projectPlaceholder')}</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </label>
        </div>
      </div>

      {isReady ? (
        <p style={readyLabelStyle}>
          <span style={readyIconStyle}>
            <AppIcon name="success" size={14} />
          </span>
          {t('dashboard.workspace.ready', {
            organization: selectedOrganizationName,
            project: selectedProjectName,
          })}
        </p>
      ) : null}
    </div>
  );
}

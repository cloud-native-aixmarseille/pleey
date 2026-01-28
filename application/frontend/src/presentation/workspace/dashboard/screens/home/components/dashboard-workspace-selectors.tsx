import type { Organization } from '../../../../../../domains/organization/entities/organization';
import type { Project } from '../../../../../../domains/project/entities/project';
import { Button } from '../../../../../shared/ui/actions/button';
import { Select } from '../../../../../shared/ui/forms/select';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../../shared/ui/foundation/ui-typography';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';

const controlsStyle = {
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: uiThemeTokens.spacing.md,
  padding: `${uiThemeTokens.spacing.md} ${uiThemeTokens.spacing.lg}`,
} as const;

const selectorGroupStyle = {
  alignItems: 'center',
  display: 'flex',
  flex: '1 1 10rem',
  gap: uiThemeTokens.spacing.sm,
  minWidth: 0,
} as const;

const selectorIconStyle = {
  alignItems: 'center',
  color: uiThemeTokens.color.text.secondary,
  display: 'inline-flex',
  flexShrink: 0,
} as const;

const selectWrapStyle = {
  flex: '1 1 0',
  minWidth: 0,
} as const;

const pathSeparatorStyle = {
  ...uiTypeScale.body,
  color: uiThemeTokens.color.text.quiet,
  flexShrink: 0,
  opacity: 0.35,
  userSelect: 'none',
} as const;

interface DashboardWorkspaceSelectorsProps {
  readonly organizations: readonly Organization[];
  readonly projects: readonly Project[];
  readonly organizationId: number | null;
  readonly projectId: number | null;
  readonly isOrganizationsLoading: boolean;
  readonly isWorkspaceLoading: boolean;
  readonly organizationLabel: string;
  readonly projectLabel: string;
  readonly organizationPlaceholder: string;
  readonly projectPlaceholder: string;
  readonly manageOrganizationsLabel: string;
  readonly manageProjectsLabel: string;
  readonly onOrganizationChange: (value: string) => void;
  readonly onProjectChange: (value: string) => void;
  readonly onManageOrganizations: () => void;
  readonly onManageProjects: () => void;
}

export function DashboardWorkspaceSelectors({
  organizations,
  projects,
  organizationId,
  projectId,
  isOrganizationsLoading,
  isWorkspaceLoading,
  organizationLabel,
  projectLabel,
  organizationPlaceholder,
  projectPlaceholder,
  manageOrganizationsLabel,
  manageProjectsLabel,
  onOrganizationChange,
  onProjectChange,
  onManageOrganizations,
  onManageProjects,
}: DashboardWorkspaceSelectorsProps) {
  return (
    <div style={controlsStyle}>
      <div style={selectorGroupStyle}>
        <span style={selectorIconStyle}>
          <AppIcon name="organization" size={18} />
        </span>
        <div style={selectWrapStyle}>
          <Select
            aria-label={organizationLabel}
            disabled={isOrganizationsLoading}
            id="dashboard-organization-select"
            onChange={(event) => onOrganizationChange(event.currentTarget.value)}
            value={organizationId === null ? '' : String(organizationId)}
          >
            <option value="">{organizationPlaceholder}</option>
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </Select>
        </div>
        <Button
          aria-label={manageOrganizationsLabel}
          intent="ghost"
          onClick={onManageOrganizations}
          size="sm"
          title={manageOrganizationsLabel}
        >
          <AppIcon name="settings" size={14} />
        </Button>
      </div>

      <span aria-hidden style={pathSeparatorStyle}>
        /
      </span>

      <div style={selectorGroupStyle}>
        <span style={selectorIconStyle}>
          <AppIcon name="catalog" size={18} />
        </span>
        <div style={selectWrapStyle}>
          <Select
            aria-label={projectLabel}
            disabled={organizationId === null || isWorkspaceLoading}
            id="dashboard-project-select"
            onChange={(event) => onProjectChange(event.currentTarget.value)}
            value={projectId === null ? '' : String(projectId)}
          >
            <option value="">{projectPlaceholder}</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        </div>
        <Button
          aria-label={manageProjectsLabel}
          intent="ghost"
          onClick={onManageProjects}
          size="sm"
          title={manageProjectsLabel}
        >
          <AppIcon name="settings" size={14} />
        </Button>
      </div>
    </div>
  );
}

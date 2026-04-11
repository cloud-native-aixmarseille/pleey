import type {
  Organization,
  OrganizationId,
} from '../../../../../../domains/organization/entities/organization';
import type { Project, ProjectId } from '../../../../../../domains/project/entities/project';
import { Button } from '../../../../../shared/ui/actions/button';
import { Select } from '../../../../../shared/ui/forms/select';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import {
  ActionRow,
  ContentStack,
  ResponsiveGrid,
} from '../../../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../../../shared/ui/layout/panels';

interface DashboardWorkspaceSelectorsProps {
  readonly organizations: readonly Organization[];
  readonly projects: readonly Project[];
  readonly organizationId: OrganizationId | null;
  readonly projectId: ProjectId | null;
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
    <ResponsiveGrid columns={{ base: 1, md: 2 }} gap="md">
      <InsetPanel>
        <ContentStack gap="xs">
          <ActionRow>
            <AppIcon name="organization" size={18} />
            <Button
              aria-label={manageOrganizationsLabel}
              intent="ghost"
              onClick={onManageOrganizations}
              size="sm"
              title={manageOrganizationsLabel}
            >
              <AppIcon name="settings" size={14} />
            </Button>
          </ActionRow>
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
        </ContentStack>
      </InsetPanel>

      <InsetPanel>
        <ContentStack gap="xs">
          <ActionRow>
            <AppIcon name="catalog" size={18} />
            <Button
              aria-label={manageProjectsLabel}
              intent="ghost"
              onClick={onManageProjects}
              size="sm"
              title={manageProjectsLabel}
            >
              <AppIcon name="settings" size={14} />
            </Button>
          </ActionRow>
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
        </ContentStack>
      </InsetPanel>
    </ResponsiveGrid>
  );
}

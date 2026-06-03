import type {
  Organization,
  OrganizationId,
} from '../../../../../../domains/organization/entities/organization';
import type { Project, ProjectId } from '../../../../../../domains/project/entities/project';
import { Button } from '../../../../../shared/ui/actions/button';
import { AsyncCombobox } from '../../../../../shared/ui/forms/async-combobox';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import {
  FlexGrowItem,
  ResponsiveGrid,
  StretchRow,
} from '../../../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../../../shared/ui/layout/panels';

interface DashboardWorkspaceSelectorsProps {
  readonly organizations: readonly Organization[];
  readonly hasMoreOrganizations: boolean;
  readonly projects: readonly Project[];
  readonly hasMoreProjects: boolean;
  readonly organizationId: OrganizationId | null;
  readonly organizationEmptyLabel: string;
  readonly organizationLoadingLabel: string;
  readonly organizationNoResultsLabel: string;
  readonly organizationSearchLabel: string;
  readonly organizationSearchPlaceholder: string;
  readonly projectId: ProjectId | null;
  readonly projectEmptyLabel: string;
  readonly projectLoadingLabel: string;
  readonly projectNoResultsLabel: string;
  readonly projectSearchLabel: string;
  readonly projectSearchPlaceholder: string;
  readonly isOrganizationsLoading: boolean;
  readonly isLoadingMoreOrganizations: boolean;
  readonly isLoadingMoreProjects: boolean;
  readonly isWorkspaceLoading: boolean;
  readonly organizationLabel: string;
  readonly projectLabel: string;
  readonly organizationPlaceholder: string;
  readonly projectPlaceholder: string;
  readonly selectedOrganizationLabel?: string | null;
  readonly selectedProjectLabel?: string | null;
  readonly manageOrganizationsLabel: string;
  readonly manageProjectsLabel: string;
  readonly onOrganizationChange: (value: string) => void;
  readonly onOrganizationSearchChange: (value: string) => void;
  readonly onLoadMoreOrganizations: () => void;
  readonly onProjectChange: (value: string) => void;
  readonly onProjectSearchChange: (value: string) => void;
  readonly onLoadMoreProjects: () => void;
  readonly onManageOrganizations: () => void;
  readonly onManageProjects: () => void;
}

export function DashboardWorkspaceSelectors({
  organizations,
  hasMoreOrganizations,
  projects,
  hasMoreProjects,
  organizationId,
  organizationEmptyLabel,
  organizationLoadingLabel,
  organizationNoResultsLabel,
  organizationSearchLabel,
  organizationSearchPlaceholder,
  projectId,
  projectEmptyLabel,
  projectLoadingLabel,
  projectNoResultsLabel,
  projectSearchLabel,
  projectSearchPlaceholder,
  isOrganizationsLoading,
  isLoadingMoreOrganizations,
  isLoadingMoreProjects,
  isWorkspaceLoading,
  organizationLabel,
  projectLabel,
  organizationPlaceholder,
  projectPlaceholder,
  selectedOrganizationLabel,
  selectedProjectLabel,
  manageOrganizationsLabel,
  manageProjectsLabel,
  onOrganizationChange,
  onOrganizationSearchChange,
  onLoadMoreOrganizations,
  onProjectChange,
  onProjectSearchChange,
  onLoadMoreProjects,
  onManageOrganizations,
  onManageProjects,
}: DashboardWorkspaceSelectorsProps) {
  return (
    <ResponsiveGrid columns={{ base: 1, md: 2 }} gap="md">
      <InsetPanel>
        <StretchRow>
          <AppIcon name="organization" size={18} />
          <FlexGrowItem>
            <AsyncCombobox
              ariaLabel={organizationLabel}
              disabled={isOrganizationsLoading}
              emptyLabel={organizationEmptyLabel}
              hasMore={hasMoreOrganizations}
              id="dashboard-organization-select"
              isLoading={isOrganizationsLoading}
              isLoadingMore={isLoadingMoreOrganizations}
              loadingLabel={organizationLoadingLabel}
              noResultsLabel={organizationNoResultsLabel}
              onChange={(value) => onOrganizationChange(value ?? '')}
              onLoadMore={onLoadMoreOrganizations}
              onSearchChange={onOrganizationSearchChange}
              options={organizations.map((organization) => ({
                value: String(organization.id),
                label: organization.name,
              }))}
              placeholder={organizationPlaceholder}
              searchAriaLabel={organizationSearchLabel}
              searchPlaceholder={organizationSearchPlaceholder}
              selectedLabel={selectedOrganizationLabel}
              value={organizationId === null ? null : String(organizationId)}
            />
          </FlexGrowItem>
          <Button
            aria-label={manageOrganizationsLabel}
            intent="ghost"
            onClick={onManageOrganizations}
            size="sm"
            title={manageOrganizationsLabel}
          >
            <AppIcon name="settings" size={14} />
          </Button>
        </StretchRow>
      </InsetPanel>

      <InsetPanel>
        <StretchRow>
          <AppIcon name="catalog" size={18} />
          <FlexGrowItem>
            <AsyncCombobox
              ariaLabel={projectLabel}
              disabled={organizationId === null || isWorkspaceLoading}
              emptyLabel={projectEmptyLabel}
              hasMore={hasMoreProjects}
              id="dashboard-project-select"
              isLoading={isWorkspaceLoading}
              isLoadingMore={isLoadingMoreProjects}
              loadingLabel={projectLoadingLabel}
              noResultsLabel={projectNoResultsLabel}
              onChange={(value) => onProjectChange(value ?? '')}
              onLoadMore={onLoadMoreProjects}
              onSearchChange={onProjectSearchChange}
              options={projects.map((project) => ({
                value: String(project.id),
                label: project.name,
              }))}
              placeholder={projectPlaceholder}
              searchAriaLabel={projectSearchLabel}
              searchPlaceholder={projectSearchPlaceholder}
              selectedLabel={selectedProjectLabel}
              value={projectId === null ? null : String(projectId)}
            />
          </FlexGrowItem>
          <Button
            aria-label={manageProjectsLabel}
            intent="ghost"
            onClick={onManageProjects}
            size="sm"
            title={manageProjectsLabel}
          >
            <AppIcon name="settings" size={14} />
          </Button>
        </StretchRow>
      </InsetPanel>
    </ResponsiveGrid>
  );
}

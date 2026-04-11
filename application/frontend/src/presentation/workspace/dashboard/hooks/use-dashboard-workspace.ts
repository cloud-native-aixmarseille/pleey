import { useEffect, useMemo, useState } from 'react';
import type { DashboardWorkspaceGateway } from '../../../../application/workspace/dashboard/facades/dashboard-workspace.facade';
import type {
  Organization,
  OrganizationId,
} from '../../../../domains/organization/entities/organization';
import type { OrganizationDashboard } from '../../../../domains/organization/entities/organization-dashboard';
import type { Project, ProjectId } from '../../../../domains/project/entities/project';
import { useWorkspaceDependencies } from '../../shared/contexts/workspace-dependencies-context';

export interface DashboardWorkspaceSelectionGateway
  extends Pick<
    DashboardWorkspaceGateway,
    | 'restoreOrganizationSelection'
    | 'loadOrganizationWorkspaceState'
    | 'setOrganizationSelection'
    | 'setProjectSelection'
  > {}

interface UseDashboardWorkspaceOptions {
  readonly dashboardWorkspace: DashboardWorkspaceSelectionGateway;
}

export function useDashboardWorkspace({ dashboardWorkspace }: UseDashboardWorkspaceOptions) {
  const { organizationIdentifier, projectIdentifier } = useWorkspaceDependencies();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [organizationDashboard, setOrganizationDashboard] = useState<OrganizationDashboard | null>(
    null,
  );
  const [organizationId, setOrganizationId] = useState<OrganizationId | null>(null);
  const [projectId, setProjectId] = useState<ProjectId | null>(null);
  const [isOrganizationsLoading, setIsOrganizationsLoading] = useState(false);
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(false);
  const [hasLoadedOrganizations, setHasLoadedOrganizations] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedOrganization = useMemo(
    () => organizations.find((organization) => organization.id === organizationId) ?? null,
    [organizationId, organizations],
  );

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === projectId) ?? null,
    [projectId, projects],
  );

  useEffect(() => {
    let ignore = false;

    const initializeWorkspace = async () => {
      setErrorMessage(null);
      setIsOrganizationsLoading(true);
      setHasLoadedOrganizations(false);

      try {
        const selection = await dashboardWorkspace.restoreOrganizationSelection();

        if (ignore) {
          return;
        }

        setOrganizations(selection.organizations);
        setOrganizationId(selection.organizationId);
      } catch (error) {
        if (ignore) {
          return;
        }

        setOrganizations([]);
        setOrganizationId(null);
        setProjects([]);
        setProjectId(null);
        setOrganizationDashboard(null);
        setErrorMessage(error instanceof Error ? error.message : 'organization.errors.loadFailed');
      } finally {
        if (!ignore) {
          setIsOrganizationsLoading(false);
          setHasLoadedOrganizations(true);
        }
      }
    };

    void initializeWorkspace();

    return () => {
      ignore = true;
    };
  }, [dashboardWorkspace]);

  useEffect(() => {
    if (!hasLoadedOrganizations) {
      return;
    }

    if (organizationId === null) {
      setProjects([]);
      setProjectId(null);
      setOrganizationDashboard(null);
      return;
    }

    let ignore = false;

    const loadWorkspaceData = async () => {
      setErrorMessage(null);
      setIsWorkspaceLoading(true);

      try {
        const workspace = await dashboardWorkspace.loadOrganizationWorkspaceState(organizationId);

        if (ignore) {
          return;
        }

        setOrganizationDashboard(workspace.organizationDashboard);
        setProjects(workspace.projects);
        setProjectId(workspace.projectId);
      } catch (error) {
        if (ignore) {
          return;
        }

        setOrganizationDashboard(null);
        setProjects([]);
        setProjectId(null);
        setErrorMessage(error instanceof Error ? error.message : 'dashboard.errors.loadFailed');
      } finally {
        if (!ignore) {
          setIsWorkspaceLoading(false);
        }
      }
    };

    void loadWorkspaceData();

    return () => {
      ignore = true;
    };
  }, [dashboardWorkspace, hasLoadedOrganizations, organizationId]);

  function handleOrganizationChange(nextValue: string) {
    const nextSelection = organizationIdentifier.parseOrNull(nextValue);

    setOrganizationId(nextSelection);
    setProjectId(null);
    dashboardWorkspace.setOrganizationSelection(nextSelection);
  }

  function handleProjectChange(nextValue: string) {
    const nextSelection = projectIdentifier.parseOrNull(nextValue);

    setProjectId(nextSelection);
    dashboardWorkspace.setProjectSelection(nextSelection);
  }

  return {
    organizations,
    projects,
    organizationDashboard,
    organizationId,
    projectId,
    selectedOrganization,
    selectedProject,
    isOrganizationsLoading,
    isWorkspaceLoading,
    errorMessage,
    handleOrganizationChange,
    handleProjectChange,
  };
}

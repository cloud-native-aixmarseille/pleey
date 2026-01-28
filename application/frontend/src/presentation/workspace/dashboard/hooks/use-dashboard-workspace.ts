import { useEffect, useMemo, useState } from 'react';
import type { DashboardWorkspaceGateway } from '../../../../application/workspace/dashboard/facades/dashboard-workspace.facade';
import type { Organization } from '../../../../domains/organization/entities/organization';
import type { OrganizationDashboard } from '../../../../domains/organization/entities/organization-dashboard';
import type { Project } from '../../../../domains/project/entities/project';

interface UseDashboardWorkspaceOptions {
  readonly dashboardWorkspace: DashboardWorkspaceGateway;
}

export function useDashboardWorkspace({ dashboardWorkspace }: UseDashboardWorkspaceOptions) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [organizationDashboard, setOrganizationDashboard] = useState<OrganizationDashboard | null>(
    null,
  );
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
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
        const selection = await dashboardWorkspace.loadOrganizationSelection();

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
        const workspace = await dashboardWorkspace.loadOrganizationWorkspace(organizationId);

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
    const nextOrganizationId = Number.parseInt(nextValue, 10);
    const nextSelection = Number.isNaN(nextOrganizationId) ? null : nextOrganizationId;

    setOrganizationId(nextSelection);
    setProjectId(null);
    dashboardWorkspace.setOrganizationSelection(nextSelection);
  }

  function handleProjectChange(nextValue: string) {
    const nextProjectId = Number.parseInt(nextValue, 10);
    const nextSelection = Number.isNaN(nextProjectId) ? null : nextProjectId;

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

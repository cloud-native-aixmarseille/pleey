import { useEffect, useRef, useState } from 'react';
import type { DashboardWorkspaceGateway } from '../../../../application/workspace/dashboard/facades/dashboard-workspace.facade';
import type {
  Organization,
  OrganizationId,
} from '../../../../domains/organization/entities/organization';
import type { OrganizationDashboard } from '../../../../domains/organization/entities/organization-dashboard';
import type { Project, ProjectId } from '../../../../domains/project/entities/project';
import type { PaginatedResult } from '../../../../domains/shared/value-objects/paginated-result';
import { usePresentationDebouncedValue } from '../../../shared/hooks/use-presentation-debounced-value';
import { usePresentationFeedbackChannel } from '../../../shared/ui/feedback/use-presentation-feedback-channel';
import { useWorkspaceDependencies } from '../../shared/contexts/workspace-dependencies-context';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;

export interface DashboardWorkspaceSelectionGateway
  extends Pick<
    DashboardWorkspaceGateway,
    | 'loadOrganizationProjectsPage'
    | 'loadOrganizationsPage'
    | 'restoreOrganizationSelection'
    | 'loadOrganizationWorkspaceState'
    | 'setOrganizationSelection'
    | 'setProjectSelection'
  > {}

interface UseDashboardWorkspaceOptions {
  readonly dashboardWorkspace: DashboardWorkspaceSelectionGateway;
}

function createEmptyPage<TItem>(page: number = DEFAULT_PAGE): PaginatedResult<TItem> {
  return {
    items: [],
    totalCount: 0,
    overallCount: 0,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    totalPages: 1,
  };
}

function appendUniqueItems<TItem extends { readonly id: number | string }>(
  currentItems: readonly TItem[],
  nextItems: readonly TItem[],
): TItem[] {
  const itemsById = new Map<string, TItem>();

  for (const item of currentItems) {
    itemsById.set(String(item.id), item);
  }

  for (const item of nextItems) {
    itemsById.set(String(item.id), item);
  }

  return [...itemsById.values()];
}

function normalizeSearchTerm(search: string): string | undefined {
  const normalizedSearch = search.trim();

  return normalizedSearch.length > 0 ? normalizedSearch : undefined;
}

export function useDashboardWorkspace({ dashboardWorkspace }: UseDashboardWorkspaceOptions) {
  const { organizationIdentifier, projectIdentifier } = useWorkspaceDependencies();
  const feedback = usePresentationFeedbackChannel();
  const [workspaceReloadVersion, setWorkspaceReloadVersion] = useState(0);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [organizationNextPage, setOrganizationNextPage] = useState(DEFAULT_PAGE + 1);
  const [organizationTotalPages, setOrganizationTotalPages] = useState(1);
  const [projectNextPage, setProjectNextPage] = useState(DEFAULT_PAGE + 1);
  const [projectTotalCount, setProjectTotalCount] = useState(0);
  const [projectTotalPages, setProjectTotalPages] = useState(1);
  const [projectPage, setProjectPage] = useState(DEFAULT_PAGE);
  const [organizationDashboard, setOrganizationDashboard] = useState<OrganizationDashboard | null>(
    null,
  );
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [organizationId, setOrganizationId] = useState<OrganizationId | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectId, setProjectId] = useState<ProjectId | null>(null);
  const [organizationSearch, setOrganizationSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [isOrganizationsLoading, setIsOrganizationsLoading] = useState(false);
  const [isLoadingMoreOrganizations, setIsLoadingMoreOrganizations] = useState(false);
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(false);
  const [isLoadingMoreProjects, setIsLoadingMoreProjects] = useState(false);
  const [hasLoadedOrganizations, setHasLoadedOrganizations] = useState(false);
  const organizationIdRef = useRef<OrganizationId | null>(organizationId);
  const organizationSearchInitializedRef = useRef(false);
  const [debouncedOrganizationSearch] = usePresentationDebouncedValue(organizationSearch);
  const [debouncedProjectSearch] = usePresentationDebouncedValue(projectSearch);
  const isProjectSearchPending =
    normalizeSearchTerm(projectSearch) !== normalizeSearchTerm(debouncedProjectSearch);

  useEffect(() => {
    organizationIdRef.current = organizationId;
  }, [organizationId]);

  useEffect(() => {
    let ignore = false;

    const initializeWorkspace = async () => {
      feedback.clearError();
      setIsOrganizationsLoading(true);
      setHasLoadedOrganizations(false);

      try {
        const selection = await dashboardWorkspace.restoreOrganizationSelection({
          page: DEFAULT_PAGE,
          pageSize: DEFAULT_PAGE_SIZE,
        });

        if (ignore) {
          return;
        }

        setOrganizations([...selection.organizationsPage.items]);
        setSelectedOrganization(
          selection.organizationsPage.items.find(
            (organization) => organization.id === selection.organizationId,
          ) ?? null,
        );
        setOrganizationTotalPages(selection.organizationsPage.totalPages);
        setOrganizationNextPage(selection.organizationsPage.page + 1);
        setOrganizationId(selection.organizationId);
        setOrganizationSearch('');
        setProjectSearch('');
        setProjectPage(DEFAULT_PAGE);
        organizationSearchInitializedRef.current = false;
      } catch (error) {
        if (ignore) {
          return;
        }

        setOrganizations([]);
        setSelectedOrganization(null);
        setOrganizationId(null);
        setProjects([]);
        setSelectedProject(null);
        setOrganizationTotalPages(1);
        setOrganizationNextPage(DEFAULT_PAGE + 1);
        setProjectId(null);
        setProjectTotalCount(0);
        setProjectTotalPages(1);
        setProjectNextPage(DEFAULT_PAGE + 1);
        setProjectPage(DEFAULT_PAGE);
        setOrganizationDashboard(null);
        feedback.handleError(error, {
          fallbackMessage: 'organization.errors.loadFailed',
        });
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

    if (!organizationSearchInitializedRef.current) {
      organizationSearchInitializedRef.current = true;
      return;
    }

    let ignore = false;

    const loadOrganizations = async () => {
      feedback.clearError();
      setIsOrganizationsLoading(true);

      try {
        const organizationsPage = await dashboardWorkspace.loadOrganizationsPage({
          page: DEFAULT_PAGE,
          pageSize: DEFAULT_PAGE_SIZE,
          search: normalizeSearchTerm(debouncedOrganizationSearch),
        });

        if (ignore) {
          return;
        }

        setOrganizations([...organizationsPage.items]);
        setOrganizationTotalPages(organizationsPage.totalPages);
        setOrganizationNextPage(organizationsPage.page + 1);
        setSelectedOrganization((currentSelection) => {
          if (organizationIdRef.current === null) {
            return null;
          }

          return (
            organizationsPage.items.find(
              (organization) => organization.id === organizationIdRef.current,
            ) ?? currentSelection
          );
        });
      } catch (error) {
        if (ignore) {
          return;
        }

        setOrganizations([]);
        setOrganizationTotalPages(1);
        setOrganizationNextPage(DEFAULT_PAGE + 1);
        feedback.handleError(error, {
          fallbackMessage: 'organization.errors.loadFailed',
        });
      } finally {
        if (!ignore) {
          setIsOrganizationsLoading(false);
        }
      }
    };

    void loadOrganizations();

    return () => {
      ignore = true;
    };
  }, [dashboardWorkspace, debouncedOrganizationSearch, hasLoadedOrganizations]);

  useEffect(() => {
    if (!hasLoadedOrganizations) {
      return;
    }

    if (organizationId === null) {
      const emptyPage = createEmptyPage<Project>();

      setProjects([...emptyPage.items]);
      setProjectId(null);
      setSelectedProject(null);
      setProjectTotalCount(emptyPage.overallCount);
      setProjectTotalPages(emptyPage.totalPages);
      setProjectNextPage(DEFAULT_PAGE + 1);
      setProjectPage(DEFAULT_PAGE);
      setOrganizationDashboard(null);
      return;
    }

    if (isProjectSearchPending) {
      return;
    }

    let ignore = false;

    const loadWorkspaceData = async () => {
      feedback.clearError();
      setIsWorkspaceLoading(true);

      try {
        const workspace = await dashboardWorkspace.loadOrganizationWorkspaceState({
          organizationId,
          page: projectPage,
          pageSize: DEFAULT_PAGE_SIZE,
          search: normalizeSearchTerm(debouncedProjectSearch),
        });

        if (ignore) {
          return;
        }

        setOrganizationDashboard(workspace.organizationDashboard);
        setProjects([...workspace.projectsPage.items]);
        setProjectId(workspace.projectId);
        setSelectedProject(
          (currentSelectedProject) =>
            workspace.projectsPage.items.find((project) => project.id === workspace.projectId) ??
            (workspace.projectId === null ? null : currentSelectedProject),
        );
        setProjectTotalCount(workspace.projectsPage.overallCount);
        setProjectTotalPages(workspace.projectsPage.totalPages);
        setProjectNextPage(workspace.projectsPage.page + 1);
      } catch (error) {
        if (ignore) {
          return;
        }

        setOrganizationDashboard(null);
        setProjects([]);
        setProjectId(null);
        setSelectedProject(null);
        setProjectTotalCount(0);
        setProjectTotalPages(1);
        setProjectNextPage(DEFAULT_PAGE + 1);
        feedback.handleError(error, {
          fallbackMessage: 'dashboard.errors.loadFailed',
        });
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
  }, [
    dashboardWorkspace,
    debouncedProjectSearch,
    hasLoadedOrganizations,
    isProjectSearchPending,
    organizationId,
    projectPage,
    workspaceReloadVersion,
  ]);

  function handleOrganizationChange(nextValue: string) {
    const nextSelection = organizationIdentifier.parseOrNull(nextValue);
    const nextOrganization =
      organizations.find((organization) => organization.id === nextSelection) ?? null;

    setSelectedOrganization(nextOrganization);
    setOrganizationId(nextSelection);
    setProjectSearch('');
    setProjectPage(DEFAULT_PAGE);
    setProjectId(null);
    setSelectedProject(null);
    setProjects([]);
    setProjectNextPage(DEFAULT_PAGE + 1);
    setProjectTotalCount(0);
    setProjectTotalPages(1);
    dashboardWorkspace.setOrganizationSelection(nextSelection);
  }

  function handleProjectChange(nextValue: string) {
    const nextSelection = projectIdentifier.parseOrNull(nextValue);
    const nextProject = projects.find((project) => project.id === nextSelection) ?? null;

    setSelectedProject(nextProject);
    setProjectId(nextSelection);
    dashboardWorkspace.setProjectSelection(nextSelection);
  }

  function handleOrganizationSearchChange(nextSearch: string) {
    setOrganizationSearch(nextSearch);
  }

  function handleProjectSearchChange(nextSearch: string) {
    setProjectSearch(nextSearch);
    setProjectPage(DEFAULT_PAGE);
  }

  function handleProjectPageChange(page: number) {
    setProjectPage(page);
  }

  function reloadWorkspace() {
    setWorkspaceReloadVersion((current) => current + 1);
  }

  async function handleLoadMoreOrganizations() {
    if (
      isOrganizationsLoading ||
      isLoadingMoreOrganizations ||
      organizationNextPage > organizationTotalPages
    ) {
      return;
    }

    setIsLoadingMoreOrganizations(true);

    try {
      const nextPage = await dashboardWorkspace.loadOrganizationsPage({
        page: organizationNextPage,
        pageSize: DEFAULT_PAGE_SIZE,
        search: normalizeSearchTerm(debouncedOrganizationSearch),
      });

      setOrganizations((currentOrganizations) =>
        appendUniqueItems(currentOrganizations, nextPage.items),
      );
      setOrganizationTotalPages(nextPage.totalPages);
      setOrganizationNextPage(nextPage.page + 1);
    } catch (error) {
      feedback.handleError(error, {
        fallbackMessage: 'organization.errors.loadFailed',
      });
    } finally {
      setIsLoadingMoreOrganizations(false);
    }
  }

  async function handleLoadMoreProjects() {
    if (
      organizationId === null ||
      isWorkspaceLoading ||
      isLoadingMoreProjects ||
      projectNextPage > projectTotalPages
    ) {
      return;
    }

    const requestedOrganizationId = organizationId;

    setIsLoadingMoreProjects(true);

    try {
      const nextPage = await dashboardWorkspace.loadOrganizationProjectsPage({
        organizationId: requestedOrganizationId,
        page: projectNextPage,
        pageSize: DEFAULT_PAGE_SIZE,
        search: normalizeSearchTerm(debouncedProjectSearch),
      });

      if (organizationIdRef.current !== requestedOrganizationId) {
        return;
      }

      setProjects((currentProjects) => appendUniqueItems(currentProjects, nextPage.items));
      setProjectTotalCount(nextPage.overallCount);
      setProjectTotalPages(nextPage.totalPages);
      setProjectNextPage(nextPage.page + 1);
    } catch (error) {
      if (organizationIdRef.current !== requestedOrganizationId) {
        return;
      }

      feedback.handleError(error, {
        fallbackMessage: 'project.errors.loadFailed',
      });
    } finally {
      if (organizationIdRef.current === requestedOrganizationId) {
        setIsLoadingMoreProjects(false);
      }
    }
  }

  return {
    organizations,
    hasMoreOrganizations: organizationNextPage <= organizationTotalPages,
    projects,
    organizationDashboard,
    organizationId,
    selectedOrganization,
    projectId,
    selectedProject,
    projectTotalCount,
    projectPage,
    projectTotalPages,
    projectSearch,
    hasMoreProjects: projectNextPage <= projectTotalPages,
    isOrganizationsLoading,
    isLoadingMoreOrganizations,
    isWorkspaceLoading,
    isLoadingMoreProjects,
    errorMessage: feedback.errorMessage,
    handleOrganizationChange,
    handleOrganizationSearchChange,
    handleLoadMoreOrganizations,
    handleProjectChange,
    handleProjectSearchChange,
    handleProjectPageChange,
    handleLoadMoreProjects,
    reloadWorkspace,
  };
}

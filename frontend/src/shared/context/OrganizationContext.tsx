import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { Organization, OrganizationDashboard } from "../types";
import { organizationService } from "../../domains/organization/organization.service";
import { useAuthManagerContext } from "../../application/app/context/AuthManagerContext";

interface OrganizationContextValue {
  organizations: Organization[];
  currentOrganization: Organization | null;
  dashboard: OrganizationDashboard | null;
  isLoading: boolean;
  error: string | null;
  setCurrentOrganization: (org: Organization | null) => void;
  loadOrganizations: () => Promise<void>;
  loadDashboard: () => Promise<void>;
  createOrganization: (
    name: string,
    description?: string
  ) => Promise<Organization>;
  clearError: () => void;
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(
  undefined
);

/**
 * Organization Context Provider
 * Manages organization state and operations with proper error handling
 */
export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { token } = useAuthManagerContext();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganizationState] =
    useState<Organization | null>(null);
  const [dashboard, setDashboard] = useState<OrganizationDashboard | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use ref to track if we've initialized to avoid unnecessary loads
  const hasInitialized = useRef(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadOrganizations = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const orgs = await organizationService.getMyOrganizations(token);
      setOrganizations(orgs);

      // Auto-select first organization if none selected
      if (orgs.length > 0 && !currentOrganization) {
        const savedOrgId = localStorage.getItem("currentOrganizationId");
        const orgToSelect = savedOrgId
          ? orgs.find((org) => org.id === Number(savedOrgId)) || orgs[0]
          : orgs[0];
        setCurrentOrganizationState(orgToSelect);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "organization.errors.loadError";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [token, currentOrganization]);

  const loadDashboard = useCallback(async () => {
    if (!token || !currentOrganization) return;

    setError(null);
    try {
      const dashboardData = await organizationService.getOrganizationDashboard(
        token,
        currentOrganization.id
      );
      setDashboard(dashboardData);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "organization.errors.dashboardFailed";
      setError(errorMessage);
    }
  }, [token, currentOrganization]);

  const setCurrentOrganization = useCallback((org: Organization | null) => {
    setCurrentOrganizationState(org);
    if (org) {
      localStorage.setItem("currentOrganizationId", org.id.toString());
    } else {
      localStorage.removeItem("currentOrganizationId");
    }
    setDashboard(null); // Clear dashboard when switching orgs
  }, []);

  const createOrganization = useCallback(
    async (name: string, description?: string): Promise<Organization> => {
      if (!token) throw new Error("organization.errors.notAuthenticated");

      setError(null);
      try {
        const newOrg = await organizationService.createOrganization(
          token,
          name,
          description
        );

        // Reload organizations to include the new one
        await loadOrganizations();

        return newOrg;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "organization.errors.createFailed";
        setError(errorMessage);
        throw err;
      }
    },
    [token, loadOrganizations]
  );

  // Load organizations on mount and when token changes
  useEffect(() => {
    if (token && !hasInitialized.current) {
      hasInitialized.current = true;
      loadOrganizations();
    } else if (!token) {
      hasInitialized.current = false;
      setOrganizations([]);
      setCurrentOrganizationState(null);
      setDashboard(null);
      setError(null);
    }
  }, [token, loadOrganizations]);

  // Load dashboard when current organization changes
  useEffect(() => {
    if (currentOrganization) {
      loadDashboard();
    }
  }, [currentOrganization, loadDashboard]);

  const value: OrganizationContextValue = {
    organizations,
    currentOrganization,
    dashboard,
    isLoading,
    error,
    setCurrentOrganization,
    loadOrganizations,
    loadDashboard,
    createOrganization,
    clearError,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

/**
 * Hook to use Organization Context
 * @throws Error if used outside OrganizationProvider
 */
export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error("useOrganization must be used within OrganizationProvider");
  }
  return context;
}

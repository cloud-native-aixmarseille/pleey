import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

import type {
  Organization,
  OrganizationDashboard,
} from "../../../../domains/organization/types";
import { container } from "../../../../app/di/container";
import { useAuthManagerContext } from "../../auth";

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
    description?: string,
  ) => Promise<Organization>;
  clearError: () => void;
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(
  undefined,
);

const { organizationRepository } = container;

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { token } = useAuthManagerContext();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganizationState] =
    useState<Organization | null>(null);
  const [dashboard, setDashboard] = useState<OrganizationDashboard | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasInitialized = useRef(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadOrganizations = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const orgs = await organizationRepository.getMyOrganizations(token);
      setOrganizations(orgs);

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
      const dashboardData =
        await organizationRepository.getOrganizationDashboard(
          token,
          currentOrganization.id,
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
    setDashboard(null);
  }, []);

  const createOrganization = useCallback(
    async (name: string, description?: string): Promise<Organization> => {
      if (!token) throw new Error("organization.errors.notAuthenticated");

      setError(null);
      try {
        const newOrg = await organizationRepository.createOrganization(
          token,
          name,
          description,
        );

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
    [token, loadOrganizations],
  );

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

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error("useOrganization must be used within OrganizationProvider");
  }
  return context;
}

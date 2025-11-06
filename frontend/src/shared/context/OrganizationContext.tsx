import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { Organization, OrganizationDashboard } from '../types';
import { organizationService } from '../../domains/organization/organization.service';
import { useAuth } from './AuthContext';

interface OrganizationContextValue {
  organizations: Organization[];
  currentOrganization: Organization | null;
  dashboard: OrganizationDashboard | null;
  isLoading: boolean;
  setCurrentOrganization: (org: Organization | null) => void;
  loadOrganizations: () => Promise<void>;
  loadDashboard: () => Promise<void>;
  createOrganization: (name: string, description?: string) => Promise<Organization>;
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(
  undefined
);

/**
 * Organization Context Provider
 * Manages organization state and operations
 */
export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganizationState] = useState<Organization | null>(null);
  const [dashboard, setDashboard] = useState<OrganizationDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadOrganizations = useCallback(async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const orgs = await organizationService.getMyOrganizations(token);
      setOrganizations(orgs);
      
      // Auto-select first organization if none selected
      if (orgs.length > 0 && !currentOrganization) {
        const savedOrgId = localStorage.getItem('currentOrganizationId');
        const orgToSelect = savedOrgId
          ? orgs.find(org => org.id === Number(savedOrgId)) || orgs[0]
          : orgs[0];
        setCurrentOrganizationState(orgToSelect);
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, currentOrganization]);

  const loadDashboard = useCallback(async () => {
    if (!token || !currentOrganization) return;
    
    try {
      const dashboardData = await organizationService.getOrganizationDashboard(
        token,
        currentOrganization.id
      );
      setDashboard(dashboardData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  }, [token, currentOrganization]);

  const setCurrentOrganization = useCallback((org: Organization | null) => {
    setCurrentOrganizationState(org);
    if (org) {
      localStorage.setItem('currentOrganizationId', org.id.toString());
    } else {
      localStorage.removeItem('currentOrganizationId');
    }
    setDashboard(null); // Clear dashboard when switching orgs
  }, []);

  const createOrganization = useCallback(
    async (name: string, description?: string): Promise<Organization> => {
      if (!token) throw new Error('Not authenticated');
      
      const newOrg = await organizationService.createOrganization(
        token,
        name,
        description
      );
      
      // Reload organizations to include the new one
      await loadOrganizations();
      
      return newOrg;
    },
    [token, loadOrganizations]
  );

  // Load organizations on mount and when token changes
  useEffect(() => {
    if (token) {
      loadOrganizations();
    } else {
      setOrganizations([]);
      setCurrentOrganization(null);
      setDashboard(null);
    }
  }, [token, loadOrganizations, setCurrentOrganization]);

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
    setCurrentOrganization,
    loadOrganizations,
    loadDashboard,
    createOrganization,
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
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
}

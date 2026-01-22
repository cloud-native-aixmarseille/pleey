import type { Organization, OrganizationId } from '../entities/organization';

/**
 * Organization Repository Interface
 * Defines the contract for organization data access
 */
export interface OrganizationRepository {
  create(name: string, description: string | null): Promise<Organization>;
  findById(id: OrganizationId): Promise<Organization | null>;
  findByIds(ids: OrganizationId[]): Promise<Organization[]>;
  findByName(name: string): Promise<Organization | null>;
  findAll(): Promise<Organization[]>;
  update(id: OrganizationId, name: string, description: string | null): Promise<Organization>;
  delete(id: OrganizationId): Promise<void>;
}

/**
 * Provider token for dependency injection
 */
export const OrganizationRepositoryProvider = Symbol('OrganizationRepository');

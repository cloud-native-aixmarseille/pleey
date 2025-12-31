import type { Organization } from '../entities/organization.entity';

/**
 * Organization Repository Interface
 * Defines the contract for organization data access
 */
export interface OrganizationRepository {
  create(name: string, description: string | null): Promise<Organization>;
  findById(id: number): Promise<Organization | null>;
  findByIds(ids: number[]): Promise<Organization[]>;
  findByName(name: string): Promise<Organization | null>;
  findAll(): Promise<Organization[]>;
  update(id: number, name: string, description: string | null): Promise<Organization>;
  delete(id: number): Promise<void>;
}

/**
 * Provider token for dependency injection
 */
export const OrganizationRepositoryProvider = Symbol('OrganizationRepository');

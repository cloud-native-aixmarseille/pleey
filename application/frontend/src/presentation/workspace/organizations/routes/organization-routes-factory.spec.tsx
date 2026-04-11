import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { OrganizationRoutesFactory } from './organization-routes-factory';

describe('OrganizationRoutesFactory', () => {
  it('registers the organizations route', () => {
    const factory = new OrganizationRoutesFactory(
      { loadOrganizationSelection: vi.fn(), loadOrganizationWorkspace: vi.fn() } as never,
      {
        createOrganization: vi.fn(),
        createProject: vi.fn(),
        updateProject: vi.fn(),
        deleteProject: vi.fn(),
      } as never,
    );

    const routes = factory.create();

    expect(routes).toHaveLength(1);
    expect(routes[0]?.path).toBe('workspace/organizations');
  });
});

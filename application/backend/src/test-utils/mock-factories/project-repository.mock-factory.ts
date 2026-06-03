import type { Mocked } from 'vitest';
import type { ProjectRepository } from '../../domain/project/ports/project.repository';
import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const PROJECT_REPOSITORY_METHOD_KINDS: MockFactoryMethodKinds<ProjectRepository> = {
  resolved: [
    'create',
    'findById',
    'countByOrganization',
    'findPageByOrganization',
    'delete',
    'update',
  ],
  returned: [],
};

export const createProjectRepositoryMock = (
  config: MockFactoryConfig<ProjectRepository> = {},
): Mocked<ProjectRepository> => {
  const mock: Mocked<ProjectRepository> = {
    create: mockFn<ProjectRepository['create']>(),
    findById: mockFn<ProjectRepository['findById']>(),
    countByOrganization: mockFn<ProjectRepository['countByOrganization']>(),
    findPageByOrganization: mockFn<ProjectRepository['findPageByOrganization']>(),
    delete: mockFn<ProjectRepository['delete']>(),
    update: mockFn<ProjectRepository['update']>(),
  };

  applyMockFactoryConfig(mock, config, PROJECT_REPOSITORY_METHOD_KINDS);
  return mock;
};

import type { Mocked } from 'vitest';
import type { OrganizationRepository } from '../../domain/organization/ports/organization.repository';
import type { OrganizationMemberRepository } from '../../domain/organization/ports/organization-member.repository';

import {
  applyMockFactoryConfig,
  type MockFactoryConfig,
  type MockFactoryMethodKinds,
  mockFn,
} from './mock-factory.utils';

const ORGANIZATION_MEMBER_REPOSITORY_METHOD_KINDS: MockFactoryMethodKinds<OrganizationMemberRepository> =
  {
    resolved: [
      'create',
      'findById',
      'findByOrganizationAndUser',
      'findByOrganization',
      'findByUser',
      'updateRole',
      'delete',
    ],
    returned: [],
  };

const ORGANIZATION_REPOSITORY_METHOD_KINDS: MockFactoryMethodKinds<OrganizationRepository> = {
  resolved: ['create', 'findById', 'findByIds', 'findByName', 'findAll', 'update', 'delete'],
  returned: [],
};

export const createOrganizationMemberRepositoryMock = (
  config: MockFactoryConfig<OrganizationMemberRepository> = {},
): Mocked<OrganizationMemberRepository> => {
  const mock: Mocked<OrganizationMemberRepository> = {
    create: mockFn<OrganizationMemberRepository['create']>(),
    findById: mockFn<OrganizationMemberRepository['findById']>(),
    findByOrganizationAndUser: mockFn<OrganizationMemberRepository['findByOrganizationAndUser']>(),
    findByOrganization: mockFn<OrganizationMemberRepository['findByOrganization']>(),
    findByUser: mockFn<OrganizationMemberRepository['findByUser']>(),
    updateRole: mockFn<OrganizationMemberRepository['updateRole']>(),
    delete: mockFn<OrganizationMemberRepository['delete']>(),
  };

  applyMockFactoryConfig(mock, config, ORGANIZATION_MEMBER_REPOSITORY_METHOD_KINDS);
  return mock;
};

export const createOrganizationRepositoryMock = (
  config: MockFactoryConfig<OrganizationRepository> = {},
): Mocked<OrganizationRepository> => {
  const mock: Mocked<OrganizationRepository> = {
    create: mockFn<OrganizationRepository['create']>(),
    findById: mockFn<OrganizationRepository['findById']>(),
    findByIds: mockFn<OrganizationRepository['findByIds']>(),
    findByName: mockFn<OrganizationRepository['findByName']>(),
    findAll: mockFn<OrganizationRepository['findAll']>(),
    update: mockFn<OrganizationRepository['update']>(),
    delete: mockFn<OrganizationRepository['delete']>(),
  };

  applyMockFactoryConfig(mock, config, ORGANIZATION_REPOSITORY_METHOD_KINDS);
  return mock;
};

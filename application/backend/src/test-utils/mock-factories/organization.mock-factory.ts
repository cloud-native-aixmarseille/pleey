import type { Mocked } from 'vitest';

import type { OrganizationMemberRepository } from '../../domain/organization/repositories/organization-member.repository.interface';

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

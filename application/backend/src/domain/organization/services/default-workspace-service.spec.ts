import { describe, expect, it } from 'vitest';
import { OrganizationIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-identifier';
import { backendTestIdentifiers } from '../../../test-utils/branded-identifiers';
import {
  createOrganizationMemberRepositoryMock,
  createOrganizationRepositoryMock,
} from '../../../test-utils/mock-factories/organization.mock-factory';
import { createProjectRepositoryMock } from '../../../test-utils/mock-factories/project-repository.mock-factory';
import { DefaultWorkspaceService } from './default-workspace-service';

const organizationIdentifier = new OrganizationIdentifier();

describe('DefaultWorkspaceService', () => {
  it('creates default organization and project when user has no memberships', async () => {
    const organizationRepository = createOrganizationRepositoryMock({
      create: { id: organizationIdentifier.parse(42) } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findLatestByUser: null,
    });
    const projectRepository = createProjectRepositoryMock();

    const service = new DefaultWorkspaceService(
      organizationRepository as never,
      memberRepository as never,
      projectRepository as never,
    );

    await service.ensure(backendTestIdentifiers.user(7));

    expect(organizationRepository.create).toHaveBeenCalledWith('Default', null);
    expect(memberRepository.create).toHaveBeenCalled();
    expect(projectRepository.create).toHaveBeenCalledWith(
      organizationIdentifier.parse(42),
      'Default',
      null,
    );
  });

  it('creates default project when membership exists but no project exists', async () => {
    const organizationRepository = createOrganizationRepositoryMock();
    const memberRepository = createOrganizationMemberRepositoryMock({
      findLatestByUser: { organizationId: organizationIdentifier.parse(11) } as never,
    });
    const projectRepository = createProjectRepositoryMock({
      countByOrganization: 0,
    });

    const service = new DefaultWorkspaceService(
      organizationRepository as never,
      memberRepository as never,
      projectRepository as never,
    );

    await service.ensure(backendTestIdentifiers.user(7));

    expect(projectRepository.countByOrganization).toHaveBeenCalledWith(
      organizationIdentifier.parse(11),
    );
    expect(projectRepository.create).toHaveBeenCalledWith(
      organizationIdentifier.parse(11),
      'Default',
      null,
    );
  });

  it('does nothing when membership and project already exist', async () => {
    const organizationRepository = createOrganizationRepositoryMock();
    const memberRepository = createOrganizationMemberRepositoryMock({
      findLatestByUser: { organizationId: organizationIdentifier.parse(11) } as never,
    });
    const projectRepository = createProjectRepositoryMock({
      countByOrganization: 1,
    });

    const service = new DefaultWorkspaceService(
      organizationRepository as never,
      memberRepository as never,
      projectRepository as never,
    );

    await service.ensure(backendTestIdentifiers.user(7));

    expect(organizationRepository.create).not.toHaveBeenCalled();
    expect(memberRepository.create).not.toHaveBeenCalled();
    expect(projectRepository.countByOrganization).toHaveBeenCalledWith(
      organizationIdentifier.parse(11),
    );
    expect(projectRepository.create).not.toHaveBeenCalled();
  });
});

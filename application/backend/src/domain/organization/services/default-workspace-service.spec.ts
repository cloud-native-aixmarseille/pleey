import { describe, expect, it } from 'vitest';
import {
  createOrganizationMemberRepositoryMock,
  createOrganizationRepositoryMock,
} from '../../../test-utils/mock-factories/organization.mock-factory';
import { createProjectRepositoryMock } from '../../../test-utils/mock-factories/project-repository.mock-factory';
import { DefaultWorkspaceService } from './default-workspace-service';

describe('DefaultWorkspaceService', () => {
  it('creates default organization and project when user has no memberships', async () => {
    const organizationRepository = createOrganizationRepositoryMock({
      create: { id: 42 } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByUser: [] as never,
    });
    const projectRepository = createProjectRepositoryMock();

    const service = new DefaultWorkspaceService(
      organizationRepository as never,
      memberRepository as never,
      projectRepository as never,
    );

    await service.ensure(7);

    expect(organizationRepository.create).toHaveBeenCalledWith('Default', null);
    expect(memberRepository.create).toHaveBeenCalled();
    expect(projectRepository.create).toHaveBeenCalledWith(42, 'Default', null);
  });

  it('creates default project when membership exists but no project exists', async () => {
    const organizationRepository = createOrganizationRepositoryMock();
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByUser: [{ organizationId: 11 }] as never,
    });
    const projectRepository = createProjectRepositoryMock({
      findByOrganization: [] as never,
    });

    const service = new DefaultWorkspaceService(
      organizationRepository as never,
      memberRepository as never,
      projectRepository as never,
    );

    await service.ensure(7);

    expect(projectRepository.findByOrganization).toHaveBeenCalledWith(11);
    expect(projectRepository.create).toHaveBeenCalledWith(11, 'Default', null);
  });

  it('does nothing when membership and project already exist', async () => {
    const organizationRepository = createOrganizationRepositoryMock();
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByUser: [{ organizationId: 11 }] as never,
    });
    const projectRepository = createProjectRepositoryMock({
      findByOrganization: [{ id: 1 }] as never,
    });

    const service = new DefaultWorkspaceService(
      organizationRepository as never,
      memberRepository as never,
      projectRepository as never,
    );

    await service.ensure(7);

    expect(organizationRepository.create).not.toHaveBeenCalled();
    expect(memberRepository.create).not.toHaveBeenCalled();
    expect(projectRepository.create).not.toHaveBeenCalled();
  });
});

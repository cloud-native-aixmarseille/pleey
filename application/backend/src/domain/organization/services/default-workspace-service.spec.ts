import { describe, expect, it } from 'vitest';
import { OrganizationIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-identifier';
import { ProjectIdentifier } from '../../../application/workspace/shared/services/identifiers/project-identifier';
import {
  createOrganizationMemberRepositoryMock,
  createOrganizationRepositoryMock,
} from '../../../test-utils/mock-factories/organization.mock-factory';
import { createProjectRepositoryMock } from '../../../test-utils/mock-factories/project-repository.mock-factory';
import { DefaultWorkspaceService } from './default-workspace-service';

const organizationIdentifier = new OrganizationIdentifier();
const projectIdentifier = new ProjectIdentifier();

describe('DefaultWorkspaceService', () => {
  it('creates default organization and project when user has no memberships', async () => {
    const organizationRepository = createOrganizationRepositoryMock({
      create: { id: organizationIdentifier.parse(42) } as never,
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
    expect(projectRepository.create).toHaveBeenCalledWith(
      organizationIdentifier.parse(42),
      'Default',
      null,
    );
  });

  it('creates default project when membership exists but no project exists', async () => {
    const organizationRepository = createOrganizationRepositoryMock();
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByUser: [{ organizationId: organizationIdentifier.parse(11) }] as never,
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

    expect(projectRepository.findByOrganization).toHaveBeenCalledWith(
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
      findByUser: [{ organizationId: organizationIdentifier.parse(11) }] as never,
    });
    const projectRepository = createProjectRepositoryMock({
      findByOrganization: [{ id: projectIdentifier.parse(1) }] as never,
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

import { describe, expect, it } from 'vitest';
import { backendTestIdentifiers } from '../../../test-utils/branded-identifiers';
import {
  createOrganizationMemberRepositoryMock,
  createOrganizationRepositoryMock,
} from '../../../test-utils/mock-factories/organization.mock-factory';
import { createProjectRepositoryMock } from '../../../test-utils/mock-factories/project-repository.mock-factory';
import { DEFAULT_PARTY_SETTINGS } from '../../game/party/shared/entities/party-settings';
import { DefaultWorkspaceService } from './default-workspace-service';

const defaultOrganizationId = backendTestIdentifiers.organization(42);
const latestOrganizationId = backendTestIdentifiers.organization(11);

describe('DefaultWorkspaceService', () => {
  it('creates default organization and project when user has no memberships', async () => {
    // Arrange
    const organizationRepository = createOrganizationRepositoryMock({
      create: { id: defaultOrganizationId } as never,
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

    // Act
    await service.ensure(backendTestIdentifiers.user(7));

    // Assert
    expect(organizationRepository.create).toHaveBeenCalledWith('Default', null, {
      defaultPartySettings: DEFAULT_PARTY_SETTINGS,
    });
    expect(memberRepository.create).toHaveBeenCalled();
    expect(projectRepository.create).toHaveBeenCalledWith(defaultOrganizationId, 'Default', null, {
      defaultPartySettings: DEFAULT_PARTY_SETTINGS,
    });
  });

  it('creates default project when membership exists but no project exists', async () => {
    // Arrange
    const organizationRepository = createOrganizationRepositoryMock();
    const memberRepository = createOrganizationMemberRepositoryMock({
      findLatestByUser: { organizationId: latestOrganizationId } as never,
    });
    const projectRepository = createProjectRepositoryMock({
      countByOrganization: 0,
    });

    const service = new DefaultWorkspaceService(
      organizationRepository as never,
      memberRepository as never,
      projectRepository as never,
    );

    // Act
    await service.ensure(backendTestIdentifiers.user(7));

    // Assert
    expect(projectRepository.countByOrganization).toHaveBeenCalledWith(latestOrganizationId);
    expect(projectRepository.create).toHaveBeenCalledWith(latestOrganizationId, 'Default', null, {
      defaultPartySettings: DEFAULT_PARTY_SETTINGS,
    });
  });

  it('does nothing when membership and project already exist', async () => {
    // Arrange
    const organizationRepository = createOrganizationRepositoryMock();
    const memberRepository = createOrganizationMemberRepositoryMock({
      findLatestByUser: { organizationId: latestOrganizationId } as never,
    });
    const projectRepository = createProjectRepositoryMock({
      countByOrganization: 1,
    });

    const service = new DefaultWorkspaceService(
      organizationRepository as never,
      memberRepository as never,
      projectRepository as never,
    );

    // Act
    await service.ensure(backendTestIdentifiers.user(7));

    // Assert
    expect(organizationRepository.create).not.toHaveBeenCalled();
    expect(memberRepository.create).not.toHaveBeenCalled();
    expect(projectRepository.countByOrganization).toHaveBeenCalledWith(latestOrganizationId);
    expect(projectRepository.create).not.toHaveBeenCalled();
  });
});

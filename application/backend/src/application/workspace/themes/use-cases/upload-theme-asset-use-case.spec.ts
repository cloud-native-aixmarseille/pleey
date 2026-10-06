import { describe, expect, it, vi } from 'vitest';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { ThemePermissionFixtureFactory } from '../../../../test-utils/fixtures/theme-permission-fixture-factory';
import { createOrganizationMemberFixture } from '../../../../test-utils/fixtures/unit/organization-member.fixture';
import { ThemeRepositoryMockFactory } from '../../../../test-utils/mock-factories/theme-repository-mock-factory';
import { GetThemeAccessUseCase } from './get-theme-access-use-case';
import { UploadThemeAssetUseCase } from './upload-theme-asset-use-case';

describe('UploadThemeAssetUseCase', () => {
  it('authorizes before reading or decoding an upload', async () => {
    // Arrange
    const repository = new ThemeRepositoryMockFactory().create();
    const membership = new ThemePermissionFixtureFactory().create(OrganizationRole.MEMBER);
    const permissions = membership.permissions;
    const processor = { process: vi.fn() };
    const source = { read: vi.fn() };
    const service = new UploadThemeAssetUseCase(repository, permissions, processor);
    // Act + Assert
    await expect(
      service.execute(backendTestIdentifiers.organization(1), backendTestIdentifiers.user(1), source),
    ).rejects.toThrow(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
    expect(source.read).not.toHaveBeenCalled();
    expect(processor.process).not.toHaveBeenCalled();
    expect(repository.createAsset).not.toHaveBeenCalled();
  });
  it('rechecks membership after a previous allowed projection', async () => {
    // Arrange
    const repository = new ThemeRepositoryMockFactory().create();
    const { permissions, memberRepository } = new ThemePermissionFixtureFactory().create();
    const source = { read: vi.fn() };
    const processor = { process: vi.fn() };
    const organizationId = backendTestIdentifiers.organization(1);
    const userId = backendTestIdentifiers.user(1);
    await new GetThemeAccessUseCase(permissions).execute(organizationId, userId);
    memberRepository.findByOrganizationAndUser.mockResolvedValue(
      createOrganizationMemberFixture({ role: OrganizationRole.MEMBER }),
    );
    const service = new UploadThemeAssetUseCase(repository, permissions, processor);
    // Act + Assert
    await expect(service.execute(organizationId, userId, source)).rejects.toThrow(
      OrganizationErrorCode.INSUFFICIENT_PERMISSIONS,
    );
    expect(source.read).not.toHaveBeenCalled();
    expect(repository.createAsset).not.toHaveBeenCalled();
  });
});

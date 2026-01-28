import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import {
  createOrganizationMemberRepositoryMock,
  createOrganizationRepositoryMock,
} from '../../../../test-utils/mock-factories/organization.mock-factory';
import type { AddMemberDto } from '../dto/add-member-dto';
import { AddMemberToOrganizationUseCase } from './add-member-to-organization-use-case';

describe('AddMemberToOrganizationUseCase', () => {
  it('throws when organization does not exist', async () => {
    const organizationRepository = createOrganizationRepositoryMock({ findById: null });
    const memberRepository = createOrganizationMemberRepositoryMock();

    const useCase = new AddMemberToOrganizationUseCase(
      organizationRepository as never,
      memberRepository as never,
    );

    const dto: AddMemberDto = { userId: 2, role: OrganizationRole.MEMBER };

    await expect(useCase.execute(1, dto, 10)).rejects.toThrow(
      OrganizationErrorCode.ORGANIZATION_NOT_FOUND,
    );
  });

  it('throws when requesting user lacks management privileges', async () => {
    const organizationRepository = createOrganizationRepositoryMock({
      findById: { id: 1 } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock();
    vi.mocked(memberRepository.findByOrganizationAndUser)
      .mockResolvedValueOnce({ hasManagementPrivileges: () => false } as never)
      .mockResolvedValueOnce(null);

    const useCase = new AddMemberToOrganizationUseCase(
      organizationRepository as never,
      memberRepository as never,
    );

    const dto: AddMemberDto = { userId: 2, role: OrganizationRole.MEMBER };

    await expect(useCase.execute(1, dto, 10)).rejects.toThrow(
      OrganizationErrorCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('adds member when allowed', async () => {
    const organizationRepository = createOrganizationRepositoryMock({
      findById: { id: 1 } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      create: { id: 123 } as never,
    });
    vi.mocked(memberRepository.findByOrganizationAndUser)
      .mockResolvedValueOnce({ hasManagementPrivileges: () => true } as never)
      .mockResolvedValueOnce(null);

    const useCase = new AddMemberToOrganizationUseCase(
      organizationRepository as never,
      memberRepository as never,
    );

    const dto: AddMemberDto = { userId: 2, role: OrganizationRole.MEMBER };

    const result = await useCase.execute(1, dto, 10);
    expect(memberRepository.create).toHaveBeenCalledWith(1, 2, OrganizationRole.MEMBER);
    expect(result).toMatchObject({ id: 123 });
  });
});

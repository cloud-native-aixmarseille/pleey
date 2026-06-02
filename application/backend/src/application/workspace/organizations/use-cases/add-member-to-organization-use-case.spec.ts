import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import { OrganizationMembershipPolicy } from '../../../../domain/organization/services/organization-membership-policy';
import { createUserFixture } from '../../../../test-utils/fixtures/unit/user.fixture';
import {
  createOrganizationMemberRepositoryMock,
  createOrganizationRepositoryMock,
} from '../../../../test-utils/mock-factories/organization.mock-factory';
import { createUserRepositoryMock } from '../../../../test-utils/mock-factories/user-repository.mock-factory';
import type { AddMemberDto } from '../dto/add-member-dto';
import { OrganizationMembershipAccessService } from '../services/organization-membership-access.service';
import { AddMemberToOrganizationUseCase } from './add-member-to-organization-use-case';

const membershipPolicy = new OrganizationMembershipPolicy();

describe('AddMemberToOrganizationUseCase', () => {
  it('throws when organization does not exist', async () => {
    const organizationRepository = createOrganizationRepositoryMock({ findById: null });
    const memberRepository = createOrganizationMemberRepositoryMock();
    const userRepository = createUserRepositoryMock({
      findByUsername: createUserFixture({
        id: 2 as never,
        username: 'captain',
        email: 'captain@pleey.io',
      }),
    });
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      organizationRepository as never,
      memberRepository as never,
      membershipPolicy,
    );

    const useCase = new AddMemberToOrganizationUseCase(
      organizationMembershipAccess,
      memberRepository as never,
      userRepository as never,
    );

    const dto: AddMemberDto = {
      role: OrganizationRole.MEMBER,
      usernameOrEmail: 'captain',
    };

    await expect(useCase.execute(1, dto, 10)).rejects.toThrow(
      OrganizationErrorCode.ORGANIZATION_NOT_FOUND,
    );

    expect(userRepository.findByUsername).not.toHaveBeenCalled();
  });

  it('throws when requesting user lacks management privileges', async () => {
    const organizationRepository = createOrganizationRepositoryMock({
      findById: { id: 1 } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock();
    const userRepository = createUserRepositoryMock({
      findByUsername: createUserFixture({
        id: 2 as never,
        username: 'captain',
        email: 'captain@pleey.io',
      }),
    });
    vi.mocked(memberRepository.findByOrganizationAndUser)
      .mockResolvedValueOnce({ hasManagementPrivileges: () => false } as never)
      .mockResolvedValueOnce(null);
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      organizationRepository as never,
      memberRepository as never,
      membershipPolicy,
    );

    const useCase = new AddMemberToOrganizationUseCase(
      organizationMembershipAccess,
      memberRepository as never,
      userRepository as never,
    );

    const dto: AddMemberDto = {
      role: OrganizationRole.MEMBER,
      usernameOrEmail: 'captain',
    };

    await expect(useCase.execute(1, dto, 10)).rejects.toThrow(
      OrganizationErrorCode.INSUFFICIENT_PERMISSIONS,
    );

    expect(userRepository.findByUsername).not.toHaveBeenCalled();
  });

  it('throws when a manager tries to add an owner', async () => {
    const organizationRepository = createOrganizationRepositoryMock({
      findById: { id: 1 } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => true,
        isOwner: () => false,
      } as never,
    });
    const userRepository = createUserRepositoryMock();
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      organizationRepository as never,
      memberRepository as never,
      membershipPolicy,
    );

    const useCase = new AddMemberToOrganizationUseCase(
      organizationMembershipAccess,
      memberRepository as never,
      userRepository as never,
    );

    await expect(
      useCase.execute(
        1,
        {
          role: OrganizationRole.OWNER,
          usernameOrEmail: 'captain',
        },
        10,
      ),
    ).rejects.toThrow(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);

    expect(userRepository.findByUsername).not.toHaveBeenCalled();
  });

  it('adds member when allowed with a username', async () => {
    const organizationRepository = createOrganizationRepositoryMock({
      findById: { id: 1 } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      create: { id: 123 } as never,
    });
    const userRepository = createUserRepositoryMock({
      findByUsername: createUserFixture({
        id: 2 as never,
        username: 'captain',
        email: 'captain@pleey.io',
      }),
    });
    vi.mocked(memberRepository.findByOrganizationAndUser)
      .mockResolvedValueOnce({ hasManagementPrivileges: () => true } as never)
      .mockResolvedValueOnce(null);
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      organizationRepository as never,
      memberRepository as never,
      membershipPolicy,
    );

    const useCase = new AddMemberToOrganizationUseCase(
      organizationMembershipAccess,
      memberRepository as never,
      userRepository as never,
    );

    const dto: AddMemberDto = {
      role: OrganizationRole.MEMBER,
      usernameOrEmail: 'captain',
    };

    const result = await useCase.execute(1, dto, 10);
    expect(memberRepository.create).toHaveBeenCalledWith(1, 2, OrganizationRole.MEMBER);
    expect(result).toMatchObject({ id: 123 });
  });

  it('adds member when allowed with an email address', async () => {
    const organizationRepository = createOrganizationRepositoryMock({
      findById: { id: 1 } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      create: { id: 123 } as never,
    });
    const userRepository = createUserRepositoryMock({
      findByEmail: createUserFixture({
        id: 4 as never,
        username: 'captain',
        email: 'captain@pleey.io',
      }),
    });
    vi.mocked(memberRepository.findByOrganizationAndUser)
      .mockResolvedValueOnce({ hasManagementPrivileges: () => true } as never)
      .mockResolvedValueOnce(null);
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      organizationRepository as never,
      memberRepository as never,
      membershipPolicy,
    );

    const useCase = new AddMemberToOrganizationUseCase(
      organizationMembershipAccess,
      memberRepository as never,
      userRepository as never,
    );

    const dto: AddMemberDto = {
      role: OrganizationRole.MEMBER,
      usernameOrEmail: 'captain@pleey.io',
    };

    await useCase.execute(1, dto, 10);

    expect(userRepository.findByEmail).toHaveBeenCalledWith('captain@pleey.io');
    expect(memberRepository.create).toHaveBeenCalledWith(1, 4, OrganizationRole.MEMBER);
  });

  it('falls back to username lookup when the identifier contains @ but no email matches', async () => {
    const organizationRepository = createOrganizationRepositoryMock({
      findById: { id: 1 } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      create: { id: 123 } as never,
    });
    const userRepository = createUserRepositoryMock({
      findByEmail: null,
      findByUsername: createUserFixture({
        id: 6 as never,
        username: 'captain@team',
        email: 'captain@pleey.io',
      }),
    });
    vi.mocked(memberRepository.findByOrganizationAndUser)
      .mockResolvedValueOnce({ hasManagementPrivileges: () => true, isOwner: () => true } as never)
      .mockResolvedValueOnce(null);
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      organizationRepository as never,
      memberRepository as never,
      membershipPolicy,
    );

    const useCase = new AddMemberToOrganizationUseCase(
      organizationMembershipAccess,
      memberRepository as never,
      userRepository as never,
    );

    await useCase.execute(
      1,
      {
        role: OrganizationRole.MEMBER,
        usernameOrEmail: 'captain@team',
      },
      10,
    );

    expect(userRepository.findByEmail).toHaveBeenCalledWith('captain@team');
    expect(userRepository.findByUsername).toHaveBeenCalledWith('captain@team');
    expect(memberRepository.create).toHaveBeenCalledWith(1, 6, OrganizationRole.MEMBER);
  });

  it('throws when the username or email does not match a user', async () => {
    const organizationRepository = createOrganizationRepositoryMock({
      findById: { id: 1 } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => true,
        isOwner: () => true,
      } as never,
    });
    const userRepository = createUserRepositoryMock({
      findByUsername: null,
    });
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      organizationRepository as never,
      memberRepository as never,
      membershipPolicy,
    );

    const useCase = new AddMemberToOrganizationUseCase(
      organizationMembershipAccess,
      memberRepository as never,
      userRepository as never,
    );

    const dto: AddMemberDto = {
      role: OrganizationRole.MEMBER,
      usernameOrEmail: 'unknown-user',
    };

    await expect(useCase.execute(1, dto, 10)).rejects.toThrow(
      OrganizationErrorCode.MEMBER_USER_NOT_FOUND,
    );
  });
});

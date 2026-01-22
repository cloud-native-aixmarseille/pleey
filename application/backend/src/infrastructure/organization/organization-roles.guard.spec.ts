import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import { AuthErrorCode } from '../../domain/auth/enums/auth-error-code.enum';
import { OrganizationErrorCode } from '../../domain/organization/enums/organization-error-code.enum';
import { OrganizationRole } from '../../domain/organization/enums/organization-role.enum';
import { createOrganizationMemberRepositoryMock } from '../../test-utils/mock-factories';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { OrganizationRolesGuard } from './organization-roles.guard';

const createContext = (request: Partial<AuthenticatedRequest>) =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
    getClass: () => ({}),
  }) as import('@nestjs/common').ExecutionContext;

describe('OrganizationRolesGuard', () => {
  it('allows when no organization roles metadata is defined', async () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const memberRepository = createOrganizationMemberRepositoryMock();
    const guard = new OrganizationRolesGuard(reflector, memberRepository);

    await expect(guard.canActivate(createContext({}))).resolves.toBe(true);
  });

  it('throws when user is missing', async () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      roles: [OrganizationRole.ADMIN],
    });
    const memberRepository = createOrganizationMemberRepositoryMock();
    const guard = new OrganizationRolesGuard(reflector, memberRepository);

    await expect(guard.canActivate(createContext({ params: { id: '1' } }))).rejects.toThrow(
      ForbiddenException,
    );
    await expect(guard.canActivate(createContext({ params: { id: '1' } }))).rejects.toThrow(
      AuthErrorCode.AUTHENTICATION_REQUIRED,
    );
  });

  it('throws when user is not a member', async () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      roles: [OrganizationRole.ADMIN],
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: null,
    });
    const guard = new OrganizationRolesGuard(reflector, memberRepository);

    const request = {
      params: { id: '1' },
      user: { id: 10, username: 'user', isAdmin: false, avatarUri: null },
    };

    await expect(guard.canActivate(createContext(request))).rejects.toThrow(ForbiddenException);
    await expect(guard.canActivate(createContext(request))).rejects.toThrow(
      OrganizationErrorCode.NOT_A_MEMBER,
    );
  });

  it('throws when role is insufficient', async () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      roles: [OrganizationRole.ADMIN],
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: { role: OrganizationRole.MEMBER } as never,
    });
    const guard = new OrganizationRolesGuard(reflector, memberRepository);

    const request = {
      params: { id: '1' },
      user: { id: 10, username: 'user', isAdmin: false, avatarUri: null },
    };

    await expect(guard.canActivate(createContext(request))).rejects.toThrow(ForbiddenException);
    await expect(guard.canActivate(createContext(request))).rejects.toThrow(
      OrganizationErrorCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('allows when member role matches', async () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      roles: [OrganizationRole.ADMIN, OrganizationRole.OWNER],
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: { role: OrganizationRole.ADMIN } as never,
    });
    const guard = new OrganizationRolesGuard(reflector, memberRepository);

    const request = {
      params: { id: '1' },
      user: { id: 10, username: 'user', isAdmin: false, avatarUri: null },
    };

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
  });

  it('resolves organization id from member id param', async () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      roles: [OrganizationRole.ADMIN],
      memberIdParam: 'memberId',
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findById: { organizationId: 44 } as never,
      findByOrganizationAndUser: { role: OrganizationRole.ADMIN } as never,
    });
    const guard = new OrganizationRolesGuard(reflector, memberRepository);

    const request = {
      params: { memberId: '22' },
      user: { id: 10, username: 'user', isAdmin: false, avatarUri: null },
    };

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
  });

  it('throws when member id does not exist', async () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      roles: [OrganizationRole.ADMIN],
      memberIdParam: 'memberId',
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findById: null,
    });
    const guard = new OrganizationRolesGuard(reflector, memberRepository);

    const request = {
      params: { memberId: '22' },
      user: { id: 10, username: 'user', isAdmin: false, avatarUri: null },
    };

    await expect(guard.canActivate(createContext(request))).rejects.toThrow(NotFoundException);
    await expect(guard.canActivate(createContext(request))).rejects.toThrow(
      OrganizationErrorCode.MEMBER_NOT_FOUND,
    );
  });
});

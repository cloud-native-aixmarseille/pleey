import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import { AppRole } from '../../domain/auth/enums/app-role.enum';
import { AuthErrorCode } from '../../domain/auth/enums/auth-error-code.enum';
import type { AuthenticatedRequest } from './authenticated-request';
import { RolesGuard } from './roles.guard';

const createContext = (request: Partial<AuthenticatedRequest>) =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
    getClass: () => ({}),
  }) as import('@nestjs/common').ExecutionContext;

describe('RolesGuard', () => {
  it('allows when no roles are required', () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const guard = new RolesGuard(reflector);

    const result = guard.canActivate(createContext({}));
    expect(result).toBe(true);
  });

  it('throws when user is missing', () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([AppRole.ADMIN]);
    const guard = new RolesGuard(reflector);

    expect(() => guard.canActivate(createContext({}))).toThrow(ForbiddenException);
    expect(() => guard.canActivate(createContext({}))).toThrow(
      AuthErrorCode.AUTHENTICATION_REQUIRED,
    );
  });

  it('throws when user lacks admin role', () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([AppRole.ADMIN]);
    const guard = new RolesGuard(reflector);

    const request = { user: { id: 1, username: 'user', isAdmin: false, avatarUri: null } };

    expect(() => guard.canActivate(createContext(request))).toThrow(ForbiddenException);
    expect(() => guard.canActivate(createContext(request))).toThrow(
      AuthErrorCode.ADMIN_PRIVILEGES_REQUIRED,
    );
  });

  it('allows when user has admin role', () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([AppRole.ADMIN]);
    const guard = new RolesGuard(reflector);

    const request = { user: { id: 1, username: 'admin', isAdmin: true, avatarUri: null } };

    const result = guard.canActivate(createContext(request));
    expect(result).toBe(true);
  });
});

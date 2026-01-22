import { CanActivate, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppRole } from '../../domain/auth/enums/app-role.enum';
import { AuthErrorCode } from '../../domain/auth/enums/auth-error-code.enum';
import type { AuthenticatedRequest } from './authenticated-request';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: import('@nestjs/common').ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException(AuthErrorCode.AUTHENTICATION_REQUIRED);
    }

    if (requiredRoles.includes(AppRole.ADMIN) && !user.isAdmin) {
      throw new ForbiddenException(AuthErrorCode.ADMIN_PRIVILEGES_REQUIRED);
    }

    return true;
  }
}

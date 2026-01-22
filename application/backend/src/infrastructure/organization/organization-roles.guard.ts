import {
  CanActivate,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthErrorCode } from '../../domain/auth/enums/auth-error-code.enum';
import { OrganizationErrorCode } from '../../domain/organization/enums/organization-error-code.enum';
import type { OrganizationMemberRepository } from '../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../domain/organization/ports/organization-member.repository';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import type { OrganizationRolesMetadata } from './organization-roles.decorator';
import { ORGANIZATION_ROLES_KEY } from './organization-roles.decorator';

@Injectable()
export class OrganizationRolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  async canActivate(context: import('@nestjs/common').ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.getAllAndOverride<OrganizationRolesMetadata | undefined>(
      ORGANIZATION_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!metadata || metadata.roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException(AuthErrorCode.AUTHENTICATION_REQUIRED);
    }

    const organizationId = await this.resolveOrganizationId(request, metadata);

    const membership = await this.memberRepository.findByOrganizationAndUser(
      organizationId,
      userId,
    );

    if (!membership) {
      throw new ForbiddenException(OrganizationErrorCode.NOT_A_MEMBER);
    }

    if (!metadata.roles.includes(membership.role)) {
      throw new ForbiddenException(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    return true;
  }

  private async resolveOrganizationId(
    request: AuthenticatedRequest,
    metadata: OrganizationRolesMetadata,
  ): Promise<number> {
    if (metadata.memberIdParam) {
      const memberId = this.getNumericParam(request, metadata.memberIdParam);
      const member = await this.memberRepository.findById(memberId);
      if (!member) {
        throw new NotFoundException(OrganizationErrorCode.MEMBER_NOT_FOUND);
      }
      return member.organizationId;
    }

    const paramKey = metadata.organizationIdParam ?? 'id';
    return this.getNumericParam(request, paramKey);
  }

  private getNumericParam(request: AuthenticatedRequest, key: string): number {
    const rawValue = request.params?.[key];
    const value = Number(rawValue);
    if (!Number.isFinite(value)) {
      throw new NotFoundException(OrganizationErrorCode.ORGANIZATION_NOT_FOUND);
    }
    return value;
  }
}

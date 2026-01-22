import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AddMemberDto } from '../../application/organization/dto/add-member.dto';
import { CreateOrganizationDto } from '../../application/organization/dto/create-organization.dto';
import { AddMemberToOrganizationUseCase } from '../../application/organization/use-cases/add-member-to-organization.use-case';
import { CreateOrganizationUseCase } from '../../application/organization/use-cases/create-organization.use-case';
import { GetOrganizationDashboardUseCase } from '../../application/organization/use-cases/get-organization-dashboard.use-case';
import { GetOrganizationsByUserUseCase } from '../../application/organization/use-cases/get-organizations-by-user.use-case';
import { RemoveMemberFromOrganizationUseCase } from '../../application/organization/use-cases/remove-member-from-organization.use-case';
import { AuthErrorCode } from '../../domain/auth/enums/auth-error-code.enum';
import type { OrganizationId } from '../../domain/organization/entities/organization';
import type { OrganizationMemberId } from '../../domain/organization/entities/organization-member';
import { OrganizationRole } from '../../domain/organization/enums/organization-role.enum';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizationRoles } from './organization-roles.decorator';
import { OrganizationRolesGuard } from './organization-roles.guard';

@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly getOrganizationsByUserUseCase: GetOrganizationsByUserUseCase,
    private readonly addMemberToOrganizationUseCase: AddMemberToOrganizationUseCase,
    private readonly removeMemberFromOrganizationUseCase: RemoveMemberFromOrganizationUseCase,
    private readonly getOrganizationDashboardUseCase: GetOrganizationDashboardUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateOrganizationDto, @Req() request: AuthenticatedRequest) {
    const userId = request.user?.id;
    if (!userId) {
      throw new ForbiddenException(AuthErrorCode.AUTHENTICATION_REQUIRED);
    }

    const organization = await this.createOrganizationUseCase.execute(dto, userId);

    return {
      id: organization.id,
      name: organization.name,
      description: organization.description,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };
  }

  @Get('my-organizations')
  @UseGuards(JwtAuthGuard)
  async getMyOrganizations(@Req() request: AuthenticatedRequest) {
    const userId = request.user?.id;
    if (!userId) {
      throw new ForbiddenException(AuthErrorCode.AUTHENTICATION_REQUIRED);
    }

    const organizations = await this.getOrganizationsByUserUseCase.execute(userId);

    return {
      organizations: organizations.map((org) => ({
        id: org.id,
        name: org.name,
        description: org.description,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
      })),
    };
  }

  @Get(':id/dashboard')
  @UseGuards(JwtAuthGuard, OrganizationRolesGuard)
  @OrganizationRoles([OrganizationRole.MEMBER, OrganizationRole.ADMIN, OrganizationRole.OWNER])
  async getDashboard(
    @Param('id', ParseIntPipe) id: OrganizationId,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = request.user?.id;
    if (!userId) {
      throw new ForbiddenException(AuthErrorCode.AUTHENTICATION_REQUIRED);
    }

    return await this.getOrganizationDashboardUseCase.execute(id, userId);
  }

  @Post(':id/members')
  @UseGuards(JwtAuthGuard, OrganizationRolesGuard)
  @OrganizationRoles([OrganizationRole.ADMIN, OrganizationRole.OWNER])
  async addMember(
    @Param('id', ParseIntPipe) organizationId: OrganizationId,
    @Body() dto: AddMemberDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = request.user?.id;
    if (!userId) {
      throw new ForbiddenException(AuthErrorCode.AUTHENTICATION_REQUIRED);
    }

    const member = await this.addMemberToOrganizationUseCase.execute(organizationId, dto, userId);

    return {
      id: member.id,
      organizationId: member.organizationId,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
    };
  }

  @Delete('members/:memberId')
  @UseGuards(JwtAuthGuard, OrganizationRolesGuard)
  @OrganizationRoles([OrganizationRole.ADMIN, OrganizationRole.OWNER], {
    memberIdParam: 'memberId',
  })
  async removeMember(
    @Param('memberId', ParseIntPipe) memberId: OrganizationMemberId,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = request.user?.id;
    if (!userId) {
      throw new ForbiddenException(AuthErrorCode.AUTHENTICATION_REQUIRED);
    }

    await this.removeMemberFromOrganizationUseCase.execute(memberId, userId);

    return {
      message: 'Member removed successfully',
    };
  }
}

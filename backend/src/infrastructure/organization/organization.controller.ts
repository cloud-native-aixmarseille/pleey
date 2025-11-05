import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrganizationUseCase } from '../../application/organization/use-cases/create-organization.use-case';
import { GetOrganizationsByUserUseCase } from '../../application/organization/use-cases/get-organizations-by-user.use-case';
import { AddMemberToOrganizationUseCase } from '../../application/organization/use-cases/add-member-to-organization.use-case';
import { RemoveMemberFromOrganizationUseCase } from '../../application/organization/use-cases/remove-member-from-organization.use-case';
import { GetOrganizationDashboardUseCase } from '../../application/organization/use-cases/get-organization-dashboard.use-case';
import { CreateOrganizationDto } from '../../application/organization/dto/create-organization.dto';
import { AddMemberDto } from '../../application/organization/dto/add-member.dto';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    isAdmin: boolean;
  };
}

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
  async create(
    @Body() dto: CreateOrganizationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = request.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const organization = await this.createOrganizationUseCase.execute(
      dto,
      userId,
    );

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
      throw new Error('User not authenticated');
    }

    const organizations =
      await this.getOrganizationsByUserUseCase.execute(userId);

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
  @UseGuards(JwtAuthGuard)
  async getDashboard(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = request.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    return await this.getOrganizationDashboardUseCase.execute(id, userId);
  }

  @Post(':id/members')
  @UseGuards(JwtAuthGuard)
  async addMember(
    @Param('id', ParseIntPipe) organizationId: number,
    @Body() dto: AddMemberDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = request.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const member = await this.addMemberToOrganizationUseCase.execute(
      organizationId,
      dto,
      userId,
    );

    return {
      id: member.id,
      organizationId: member.organizationId,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
    };
  }

  @Delete('members/:memberId')
  @UseGuards(JwtAuthGuard)
  async removeMember(
    @Param('memberId', ParseIntPipe) memberId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = request.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    await this.removeMemberFromOrganizationUseCase.execute(memberId, userId);

    return {
      message: 'Member removed successfully',
    };
  }
}

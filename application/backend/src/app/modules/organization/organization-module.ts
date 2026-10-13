import { Module } from '@nestjs/common';
import { GetOrganizationDashboardUseCase } from '../../../application/workspace/dashboard/use-cases/get-organization-dashboard-use-case';
import { AddMemberToOrganizationUseCase } from '../../../application/workspace/organizations/use-cases/add-member-to-organization-use-case';
import { CreateOrganizationUseCase } from '../../../application/workspace/organizations/use-cases/create-organization-use-case';
import { ListOrganizationMembersUseCase } from '../../../application/workspace/organizations/use-cases/list-organization-members-use-case';
import { ListUserOrganizationsUseCase } from '../../../application/workspace/organizations/use-cases/list-user-organizations-use-case';
import { RemoveMemberFromOrganizationUseCase } from '../../../application/workspace/organizations/use-cases/remove-member-from-organization-use-case';
import { UpdateOrganizationMemberRoleUseCase } from '../../../application/workspace/organizations/use-cases/update-organization-member-role-use-case';
import { UpdateOrganizationUseCase } from '../../../application/workspace/organizations/use-cases/update-organization-use-case';
import { WorkspaceGameManagementPort } from '../../../application/workspace/ports/workspace-game-management.port';
import { ProjectPermissionService } from '../../../application/workspace/projects/services/project-permission-service';
import { CreateProjectUseCase } from '../../../application/workspace/projects/use-cases/create-project-use-case';
import { DeleteProjectUseCase } from '../../../application/workspace/projects/use-cases/delete-project-use-case';
import { ListOrganizationProjectsUseCase } from '../../../application/workspace/projects/use-cases/list-organization-projects-use-case';
import { UpdateProjectUseCase } from '../../../application/workspace/projects/use-cases/update-project-use-case';
import { OrganizationIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-identifier';
import { OrganizationMemberIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-member-identifier';
import { ProjectIdentifier } from '../../../application/workspace/shared/services/identifiers/project-identifier';
import { DefaultWorkspaceService } from '../../../domain/organization/services/default-workspace-service';
import { ProjectRepositoryProvider } from '../../../domain/project/ports/project.repository';
import { ProjectPermissionPolicy } from '../../../domain/project/services/project-permission-policy';
import { PrismaWorkspaceGameManagementAdapter } from '../../../infrastructure/game/management/prisma-workspace-game-management.adapter';
import { PrismaPartySettingsMapper } from '../../../infrastructure/game/shared/prisma-party-settings.mapper';
import { PrismaProjectRepository } from '../../../infrastructure/project/repositories/prisma-project-repository';
import { OrganizationResolver } from '../../../presentation/organization/graphql/organization-resolver';
import { ProjectResolver } from '../../../presentation/project/graphql/project-resolver';
import { DatabaseModule } from '../database/database-module';
import { GameModule } from '../game/game-module';
import { IdentityModule } from '../identity/identity-module';
import { SharedServicesModule } from '../shared/shared-services.module';
import { ThemeModule } from '../theme/theme-module';
import { OrganizationAccessModule } from './organization-access-module';

@Module({
  imports: [OrganizationAccessModule, ThemeModule, IdentityModule, DatabaseModule, GameModule, SharedServicesModule],
  providers: [
    ProjectPermissionService,
    { provide: ProjectPermissionPolicy, useValue: new ProjectPermissionPolicy() },
    // Repository implementations
    PrismaProjectRepository,
    PrismaPartySettingsMapper,
    PrismaWorkspaceGameManagementAdapter,
    OrganizationIdentifier,
    OrganizationMemberIdentifier,
    ProjectIdentifier,

    // Repository bindings
    {
      provide: ProjectRepositoryProvider,
      useExisting: PrismaProjectRepository,
    },
    {
      provide: WorkspaceGameManagementPort,
      useExisting: PrismaWorkspaceGameManagementAdapter,
    },

    // Use cases
    CreateOrganizationUseCase,
    UpdateOrganizationUseCase,
    ListUserOrganizationsUseCase,
    ListOrganizationMembersUseCase,
    AddMemberToOrganizationUseCase,
    RemoveMemberFromOrganizationUseCase,
    UpdateOrganizationMemberRoleUseCase,
    GetOrganizationDashboardUseCase,
    DefaultWorkspaceService,
    CreateProjectUseCase,
    UpdateProjectUseCase,
    DeleteProjectUseCase,
    ListOrganizationProjectsUseCase,
    OrganizationResolver,
    ProjectResolver,
  ],
})
export class OrganizationModule {}

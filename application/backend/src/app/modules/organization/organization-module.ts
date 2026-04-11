import { Module } from '@nestjs/common';
import { GetOrganizationDashboardUseCase } from '../../../application/workspace/dashboard/use-cases/get-organization-dashboard-use-case';
import { AddMemberToOrganizationUseCase } from '../../../application/workspace/organizations/use-cases/add-member-to-organization-use-case';
import { CreateOrganizationUseCase } from '../../../application/workspace/organizations/use-cases/create-organization-use-case';
import { ListUserOrganizationsUseCase } from '../../../application/workspace/organizations/use-cases/list-user-organizations-use-case';
import { RemoveMemberFromOrganizationUseCase } from '../../../application/workspace/organizations/use-cases/remove-member-from-organization-use-case';
import { WorkspaceGameManagementPort } from '../../../application/workspace/ports/workspace-game-management.port';
import { CreateProjectUseCase } from '../../../application/workspace/projects/use-cases/create-project-use-case';
import { DeleteProjectUseCase } from '../../../application/workspace/projects/use-cases/delete-project-use-case';
import { ListOrganizationProjectsUseCase } from '../../../application/workspace/projects/use-cases/list-organization-projects-use-case';
import { UpdateProjectUseCase } from '../../../application/workspace/projects/use-cases/update-project-use-case';
import { OrganizationIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-identifier';
import { OrganizationMemberIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-member-identifier';
import { ProjectIdentifier } from '../../../application/workspace/shared/services/identifiers/project-identifier';
import { OrganizationRepositoryProvider } from '../../../domain/organization/ports/organization.repository';
import { OrganizationMemberRepositoryProvider } from '../../../domain/organization/ports/organization-member.repository';
import { DefaultWorkspaceService } from '../../../domain/organization/services/default-workspace-service';
import { ProjectRepositoryProvider } from '../../../domain/project/ports/project.repository';
import { PrismaWorkspaceGameManagementAdapter } from '../../../infrastructure/game/management/prisma-workspace-game-management.adapter';
import { PrismaOrganizationMemberRepository } from '../../../infrastructure/organization/repositories/prisma-organization-member-repository';
import { PrismaOrganizationRepository } from '../../../infrastructure/organization/repositories/prisma-organization-repository';
import { PrismaProjectRepository } from '../../../infrastructure/project/repositories/prisma-project-repository';
import { OrganizationResolver } from '../../../presentation/organization/graphql/organization-resolver';
import { ProjectResolver } from '../../../presentation/project/graphql/project-resolver';
import { DatabaseModule } from '../database/database-module';
import { GameModule } from '../game/game-module';
import { IdentityModule } from '../identity/identity-module';

@Module({
  imports: [IdentityModule, DatabaseModule, GameModule],
  providers: [
    // Repository implementations
    PrismaOrganizationRepository,
    PrismaOrganizationMemberRepository,
    PrismaProjectRepository,
    PrismaWorkspaceGameManagementAdapter,
    OrganizationIdentifier,
    OrganizationMemberIdentifier,
    ProjectIdentifier,

    // Repository bindings
    {
      provide: OrganizationRepositoryProvider,
      useExisting: PrismaOrganizationRepository,
    },
    {
      provide: OrganizationMemberRepositoryProvider,
      useExisting: PrismaOrganizationMemberRepository,
    },
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
    ListUserOrganizationsUseCase,
    AddMemberToOrganizationUseCase,
    RemoveMemberFromOrganizationUseCase,
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

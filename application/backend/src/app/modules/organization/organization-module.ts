import { Module } from '@nestjs/common';
import { ListProjectQuizzesUseCase } from '../../../application/quiz-management/use-cases/list-project-quizzes-use-case';
import { GetOrganizationDashboardUseCase } from '../../../application/workspace/dashboard/use-cases/get-organization-dashboard-use-case';
import { ListProjectDashboardGamesUseCase } from '../../../application/workspace/dashboard/use-cases/list-project-dashboard-games-use-case';
import { AddMemberToOrganizationUseCase } from '../../../application/workspace/organizations/use-cases/add-member-to-organization-use-case';
import { CreateOrganizationUseCase } from '../../../application/workspace/organizations/use-cases/create-organization-use-case';
import { ListUserOrganizationsUseCase } from '../../../application/workspace/organizations/use-cases/list-user-organizations-use-case';
import { RemoveMemberFromOrganizationUseCase } from '../../../application/workspace/organizations/use-cases/remove-member-from-organization-use-case';
import { CreateProjectUseCase } from '../../../application/workspace/projects/use-cases/create-project-use-case';
import { DeleteProjectUseCase } from '../../../application/workspace/projects/use-cases/delete-project-use-case';
import { ListOrganizationProjectsUseCase } from '../../../application/workspace/projects/use-cases/list-organization-projects-use-case';
import { UpdateProjectUseCase } from '../../../application/workspace/projects/use-cases/update-project-use-case';
import { GameRepositoryProvider } from '../../../domain/game/ports/repositories/game.repository';
import { GameSessionRepositoryProvider } from '../../../domain/game/ports/repositories/game-session.repository';
import { OrganizationRepositoryProvider } from '../../../domain/organization/ports/organization.repository';
import { OrganizationMemberRepositoryProvider } from '../../../domain/organization/ports/organization-member.repository';
import { DefaultWorkspaceService } from '../../../domain/organization/services/default-workspace-service';
import { ProjectRepositoryProvider } from '../../../domain/project/ports/project.repository';
import { QuizRepositoryProvider } from '../../../domain/quiz/ports/quiz.repository';
import { PrismaGameRepository } from '../../../infrastructure/game/repositories/prisma-game-repository';
import { PrismaGameSessionRepository } from '../../../infrastructure/game/repositories/prisma-game-session-repository';
import { PrismaOrganizationMemberRepository } from '../../../infrastructure/organization/repositories/prisma-organization-member-repository';
import { PrismaOrganizationRepository } from '../../../infrastructure/organization/repositories/prisma-organization-repository';
import { PrismaProjectRepository } from '../../../infrastructure/project/repositories/prisma-project-repository';
import { PrismaQuizRepository } from '../../../infrastructure/quiz/repositories/prisma-quiz-repository';
import { OrganizationResolver } from '../../../presentation/workspace/graphql/organization-resolver';
import { ProjectResolver } from '../../../presentation/workspace/graphql/project-resolver';
import { AuthModule } from '../auth/auth-module';
import { DatabaseModule } from '../database/database-module';

@Module({
  imports: [AuthModule, DatabaseModule],
  providers: [
    // Repository implementations
    PrismaOrganizationRepository,
    PrismaOrganizationMemberRepository,
    PrismaQuizRepository,
    PrismaGameSessionRepository,
    PrismaGameRepository,
    PrismaProjectRepository,

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
      provide: QuizRepositoryProvider,
      useExisting: PrismaQuizRepository,
    },
    {
      provide: GameRepositoryProvider,
      useExisting: PrismaGameRepository,
    },
    {
      provide: GameSessionRepositoryProvider,
      useExisting: PrismaGameSessionRepository,
    },

    // Use cases
    CreateOrganizationUseCase,
    ListUserOrganizationsUseCase,
    AddMemberToOrganizationUseCase,
    RemoveMemberFromOrganizationUseCase,
    GetOrganizationDashboardUseCase,
    DefaultWorkspaceService,
    ListProjectQuizzesUseCase,
    CreateProjectUseCase,
    UpdateProjectUseCase,
    DeleteProjectUseCase,
    ListProjectDashboardGamesUseCase,
    ListOrganizationProjectsUseCase,
    OrganizationResolver,
    ProjectResolver,
  ],
})
export class OrganizationModule {}

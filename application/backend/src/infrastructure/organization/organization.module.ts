import { Module } from '@nestjs/common';
import { AddMemberToOrganizationUseCase } from '../../application/organization/use-cases/add-member-to-organization.use-case';
import { CreateOrganizationUseCase } from '../../application/organization/use-cases/create-organization.use-case';
import { GetOrganizationDashboardUseCase } from '../../application/organization/use-cases/get-organization-dashboard.use-case';
import { GetOrganizationsByUserUseCase } from '../../application/organization/use-cases/get-organizations-by-user.use-case';
import { RemoveMemberFromOrganizationUseCase } from '../../application/organization/use-cases/remove-member-from-organization.use-case';
import { GetQuizzesByOrganizationUseCase } from '../../application/quiz/use-cases/get-quizzes-by-organization.use-case';
import { GameSessionRepositoryProvider } from '../../domain/game/ports/game-session.repository';
import { OrganizationRepositoryProvider } from '../../domain/organization/ports/organization.repository';
import { OrganizationMemberRepositoryProvider } from '../../domain/organization/ports/organization-member.repository';
import { QuizRepositoryProvider } from '../../domain/quiz/ports/quiz.repository';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { PrismaGameSessionRepository } from '../game/repositories/prisma-game-session.repository';
import { PrismaQuizRepository } from '../quiz/repositories/prisma-quiz.repository';
import { OrganizationController } from './organization.controller';
import { OrganizationRolesGuard } from './organization-roles.guard';
import { PrismaOrganizationRepository } from './repositories/prisma-organization.repository';
import { PrismaOrganizationMemberRepository } from './repositories/prisma-organization-member.repository';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [OrganizationController],
  providers: [
    // Repository implementations
    PrismaOrganizationRepository,
    PrismaOrganizationMemberRepository,
    PrismaQuizRepository,
    PrismaGameSessionRepository,

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
      provide: QuizRepositoryProvider,
      useExisting: PrismaQuizRepository,
    },
    {
      provide: GameSessionRepositoryProvider,
      useExisting: PrismaGameSessionRepository,
    },

    // Use cases
    CreateOrganizationUseCase,
    GetOrganizationsByUserUseCase,
    AddMemberToOrganizationUseCase,
    RemoveMemberFromOrganizationUseCase,
    GetOrganizationDashboardUseCase,
    GetQuizzesByOrganizationUseCase,
    OrganizationRolesGuard,
  ],
})
export class OrganizationModule {}

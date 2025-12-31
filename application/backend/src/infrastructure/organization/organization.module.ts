import { Module } from '@nestjs/common';
import { AddMemberToOrganizationUseCase } from '../../application/organization/use-cases/add-member-to-organization.use-case';
import { CreateOrganizationUseCase } from '../../application/organization/use-cases/create-organization.use-case';
import { GetOrganizationDashboardUseCase } from '../../application/organization/use-cases/get-organization-dashboard.use-case';
import { GetOrganizationsByUserUseCase } from '../../application/organization/use-cases/get-organizations-by-user.use-case';
import { RemoveMemberFromOrganizationUseCase } from '../../application/organization/use-cases/remove-member-from-organization.use-case';
import { GetQuizzesByOrganizationUseCase } from '../../application/quiz/use-cases/get-quizzes-by-organization.use-case';
import { GameSessionRepositoryProvider } from '../../domain/game/repositories/game-session.repository.interface';
import { OrganizationRepositoryProvider } from '../../domain/organization/repositories/organization.repository.interface';
import { OrganizationMemberRepositoryProvider } from '../../domain/organization/repositories/organization-member.repository.interface';
import { QuizRepositoryProvider } from '../../domain/quiz/repositories/quiz.repository.interface';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { PrismaGameSessionRepository } from '../repositories/prisma-game-session.repository';
import { PrismaOrganizationRepository } from '../repositories/prisma-organization.repository';
import { PrismaOrganizationMemberRepository } from '../repositories/prisma-organization-member.repository';
import { PrismaQuizRepository } from '../repositories/prisma-quiz.repository';
import { OrganizationController } from './organization.controller';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [OrganizationController],
  providers: [
    // Use cases
    CreateOrganizationUseCase,
    GetOrganizationsByUserUseCase,
    AddMemberToOrganizationUseCase,
    RemoveMemberFromOrganizationUseCase,
    GetOrganizationDashboardUseCase,
    GetQuizzesByOrganizationUseCase,

    // Repositories
    PrismaOrganizationRepository,
    PrismaOrganizationMemberRepository,
    PrismaQuizRepository,
    PrismaGameSessionRepository,

    // Repository providers
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
  ],
  exports: [OrganizationRepositoryProvider, OrganizationMemberRepositoryProvider],
})
export class OrganizationModule {}

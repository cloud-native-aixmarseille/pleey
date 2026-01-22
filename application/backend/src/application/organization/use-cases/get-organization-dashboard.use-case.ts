import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import { GameSessionStatus } from '../../../domain/game/enums/game-session-status.enum';
import type { GameSessionRepository } from '../../../domain/game/ports/game-session.repository';
import { GameSessionRepositoryProvider } from '../../../domain/game/ports/game-session.repository';
import type { OrganizationId } from '../../../domain/organization/entities/organization';
import { OrganizationErrorCode } from '../../../domain/organization/enums/organization-error-code.enum';
import type { OrganizationRepository } from '../../../domain/organization/ports/organization.repository';
import { OrganizationRepositoryProvider } from '../../../domain/organization/ports/organization.repository';
import type { OrganizationMemberRepository } from '../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../domain/organization/ports/organization-member.repository';
import type { QuizRepository } from '../../../domain/quiz/ports/quiz.repository';
import { QuizRepositoryProvider } from '../../../domain/quiz/ports/quiz.repository';

export interface OrganizationDashboard {
  organization: {
    id: OrganizationId;
    name: string;
    description: string | null;
  };
  stats: {
    totalQuizzes: number;
    totalGameSessions: number;
    activeGameSessions: number;
    totalMembers: number;
  };
}

/**
 * Use case for getting organization dashboard with aggregated stats
 */
@Injectable()
export class GetOrganizationDashboardUseCase {
  constructor(
    @Inject(OrganizationRepositoryProvider)
    private readonly organizationRepository: OrganizationRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
    @Inject(QuizRepositoryProvider)
    private readonly quizRepository: QuizRepository,
    @Inject(GameSessionRepositoryProvider)
    private readonly sessionRepository: GameSessionRepository,
  ) {}

  async execute(
    organizationId: OrganizationId,
    requestingUserId: UserId,
  ): Promise<OrganizationDashboard> {
    // Verify organization exists
    const organization = await this.organizationRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundException(OrganizationErrorCode.ORGANIZATION_NOT_FOUND);
    }

    // Verify user is a member
    const membership = await this.memberRepository.findByOrganizationAndUser(
      organizationId,
      requestingUserId,
    );
    if (!membership) {
      throw new ForbiddenException(OrganizationErrorCode.NOT_A_MEMBER);
    }

    // Get stats
    const quizzes = await this.quizRepository.findByOrganization(organizationId);
    const members = await this.memberRepository.findByOrganization(organizationId);

    const sessionsByQuiz = await Promise.all(
      quizzes.map((quiz) => this.sessionRepository.findByQuizId(quiz.id)),
    );
    const sessions = sessionsByQuiz.flat();

    const activeSessions = sessions.filter(
      (session) =>
        session.status === GameSessionStatus.WAITING ||
        session.status === GameSessionStatus.ACTIVE ||
        session.status === GameSessionStatus.PAUSED,
    );

    return {
      organization: {
        id: organization.id,
        name: organization.name,
        description: organization.description,
      },
      stats: {
        totalQuizzes: quizzes.length,
        totalGameSessions: sessions.length,
        activeGameSessions: activeSessions.length,
        totalMembers: members.length,
      },
    };
  }
}

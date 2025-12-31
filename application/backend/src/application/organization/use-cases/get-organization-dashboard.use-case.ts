import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { GameSessionRepository } from '../../../domain/game/repositories/game-session.repository.interface';
import { GameSessionRepositoryProvider } from '../../../domain/game/repositories/game-session.repository.interface';
import type { OrganizationRepository } from '../../../domain/organization/repositories/organization.repository.interface';
import { OrganizationRepositoryProvider } from '../../../domain/organization/repositories/organization.repository.interface';
import type { OrganizationMemberRepository } from '../../../domain/organization/repositories/organization-member.repository.interface';
import { OrganizationMemberRepositoryProvider } from '../../../domain/organization/repositories/organization-member.repository.interface';
import type { QuizRepository } from '../../../domain/quiz/repositories/quiz.repository.interface';
import { QuizRepositoryProvider } from '../../../domain/quiz/repositories/quiz.repository.interface';
import { OrganizationErrorCode } from '../enums/organization-error-code.enum';

export interface OrganizationDashboard {
  organization: {
    id: number;
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

  async execute(organizationId: number, requestingUserId: number): Promise<OrganizationDashboard> {
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
    const sessions = await this.sessionRepository.findByOrganization(organizationId);
    const members = await this.memberRepository.findByOrganization(organizationId);

    const activeSessions = sessions.filter(
      (s) => s.status === 'waiting' || s.status === 'active' || s.status === 'paused',
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

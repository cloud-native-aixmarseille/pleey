import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import type { OrganizationId } from '../../../domain/organization/entities/organization';
import { OrganizationErrorCode } from '../../../domain/organization/enums/organization-error-code.enum';
import type { OrganizationMemberRepository } from '../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../domain/organization/ports/organization-member.repository';
import type { Quiz } from '../../../domain/quiz/entities/quiz';
import type { QuizRepository } from '../../../domain/quiz/ports/quiz.repository';
import { QuizRepositoryProvider } from '../../../domain/quiz/ports/quiz.repository';

/**
 * Get Quizzes By Organization Use Case
 * Retrieves all quizzes for a specific organization
 */
@Injectable()
export class GetQuizzesByOrganizationUseCase {
  constructor(
    @Inject(QuizRepositoryProvider)
    private readonly quizRepository: QuizRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  async execute(organizationId: OrganizationId, userId: UserId): Promise<Quiz[]> {
    // Verify user is a member of the organization
    const membership = await this.memberRepository.findByOrganizationAndUser(
      organizationId,
      userId,
    );
    if (!membership) {
      throw new ForbiddenException(OrganizationErrorCode.NOT_A_MEMBER);
    }

    return this.quizRepository.findByOrganization(organizationId);
  }
}

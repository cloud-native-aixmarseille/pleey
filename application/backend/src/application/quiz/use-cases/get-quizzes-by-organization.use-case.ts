import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { OrganizationMemberRepository } from '../../../domain/organization/repositories/organization-member.repository.interface';
import { OrganizationMemberRepositoryProvider } from '../../../domain/organization/repositories/organization-member.repository.interface';
import type { Quiz } from '../../../domain/quiz/entities/quiz';
import type { QuizRepository } from '../../../domain/quiz/repositories/quiz.repository.interface';
import { QuizRepositoryProvider } from '../../../domain/quiz/repositories/quiz.repository.interface';
import { OrganizationErrorCode } from '../../organization/enums/organization-error-code.enum';

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

  async execute(organizationId: number, userId: number): Promise<Quiz[]> {
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

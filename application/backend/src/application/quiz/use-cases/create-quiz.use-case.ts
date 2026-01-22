import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import { OrganizationErrorCode } from '../../../domain/organization/enums/organization-error-code.enum';
import type { OrganizationMemberRepository } from '../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../domain/organization/ports/organization-member.repository';
import type { Quiz } from '../../../domain/quiz/entities/quiz';
import type { QuizRepository } from '../../../domain/quiz/ports/quiz.repository';
import { QuizRepositoryProvider } from '../../../domain/quiz/ports/quiz.repository';
import type { CreateQuizDto } from '../dto/create-quiz.dto';

/**
 * Create Quiz Use Case
 * Handles quiz creation logic
 */
@Injectable()
export class CreateQuizUseCase {
  constructor(
    @Inject(QuizRepositoryProvider)
    private readonly quizRepository: QuizRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  async execute(dto: CreateQuizDto, userId: UserId): Promise<Quiz> {
    // Verify user is a member of the organization
    const membership = await this.memberRepository.findByOrganizationAndUser(
      dto.organizationId,
      userId,
    );
    if (!membership) {
      throw new ForbiddenException(OrganizationErrorCode.NOT_A_MEMBER);
    }

    // Check if member can create quizzes
    if (!membership.canCreateQuizzes()) {
      throw new ForbiddenException(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    return this.quizRepository.create(
      dto.title,
      dto.description || null,
      userId,
      dto.organizationId,
    );
  }
}

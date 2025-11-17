import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import type { Quiz } from '../../../domain/quiz/entities/quiz.entity';
import { QuizRepositoryProvider } from '../../../domain/quiz/repositories/quiz.repository.interface';
import type { QuizRepository } from '../../../domain/quiz/repositories/quiz.repository.interface';
import type { CreateQuizDto } from '../dto/create-quiz.dto';
import { OrganizationMemberRepositoryProvider } from '../../../domain/organization/repositories/organization-member.repository.interface';
import type { OrganizationMemberRepository } from '../../../domain/organization/repositories/organization-member.repository.interface';
import { OrganizationErrorCode } from '../../organization/enums/organization-error-code.enum';

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

  async execute(dto: CreateQuizDto, userId: number): Promise<Quiz> {
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
      throw new ForbiddenException(
        OrganizationErrorCode.INSUFFICIENT_PERMISSIONS,
      );
    }

    return this.quizRepository.create(
      dto.title,
      dto.description || null,
      userId,
      dto.organizationId,
    );
  }
}

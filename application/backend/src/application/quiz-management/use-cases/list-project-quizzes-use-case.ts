import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../domain/auth/entities/user';
import { OrganizationErrorCode } from '../../../domain/organization/enums/organization-error-code.enum';
import type { OrganizationMemberRepository } from '../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../domain/organization/ports/organization-member.repository';
import type { ProjectId } from '../../../domain/project/entities/project';
import type { ProjectRepository } from '../../../domain/project/ports/project.repository';
import { ProjectRepositoryProvider } from '../../../domain/project/ports/project.repository';
import type { Quiz } from '../../../domain/quiz/entities/quiz';
import type { QuizRepository } from '../../../domain/quiz/ports/quiz.repository';
import { QuizRepositoryProvider } from '../../../domain/quiz/ports/quiz.repository';

@Injectable()
export class ListProjectQuizzesUseCase {
  constructor(
    @Inject(QuizRepositoryProvider)
    private readonly quizRepository: QuizRepository,
    @Inject(ProjectRepositoryProvider)
    private readonly projectRepository: ProjectRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  async execute(projectId: ProjectId, userId: UserId): Promise<Quiz[]> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new Error(OrganizationErrorCode.ORGANIZATION_NOT_FOUND);
    }

    const membership = await this.memberRepository.findByOrganizationAndUser(
      project.organizationId,
      userId,
    );
    if (!membership) {
      throw new Error(OrganizationErrorCode.NOT_A_MEMBER);
    }

    return this.quizRepository.findByProject(projectId);
  }
}

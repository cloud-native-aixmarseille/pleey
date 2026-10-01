import { vi } from 'vitest';
import { QuizQuestionIdentifier } from '../../../application/game/types/quiz/services/quiz-question-identifier';
import { GetQuizQuestionMediaAccessUseCase } from '../../../application/game/types/quiz/use-cases/get-quiz-question-media-access-use-case';
import { GameTypeIdentifier } from '../../../application/game/types/shared/services/game-type-identifier';
import { GameTypeManagementAccessGuard } from '../../../application/game/types/shared/services/game-type-management-access-guard';
import { Quiz } from '../../../domain/game/types/quiz/entities/quiz';
import { QuizQuestion, QuizQuestionType } from '../../../domain/game/types/quiz/entities/quiz-question';
import type { QuizManagementRepository } from '../../../domain/game/types/quiz/ports/quiz-management.repository';
import type { QuizQuestionRepository } from '../../../domain/game/types/quiz/ports/quiz-question.repository';
import { OrganizationMember } from '../../../domain/organization/entities/organization-member';
import { OrganizationRole } from '../../../domain/organization/enums/organization-role.enum';
import type { OrganizationMemberRepository } from '../../../domain/organization/ports/organization-member.repository';
import { Project } from '../../../domain/project/entities/project';
import type { ProjectRepository } from '../../../domain/project/ports/project.repository';
import { backendTestIdentifiers } from '../../branded-identifiers';

export class QuizMediaAccessFixture {
  readonly userId = backendTestIdentifiers.user(1);
  readonly assetId = backendTestIdentifiers.media(20);
  readonly quizId = new GameTypeIdentifier().parse(backendTestIdentifiers.game(5));
  readonly project = new Project(
    backendTestIdentifiers.project(1),
    'Project',
    null,
    backendTestIdentifiers.organization(1),
    new Date('2026-09-28T00:00:00Z'),
  );
  readonly quiz = new Quiz(
    this.quizId,
    backendTestIdentifiers.game(6),
    this.project.id,
    'Quiz',
    null,
    new Date('2026-09-28T00:00:00Z'),
    1,
  );
  readonly question = new QuizQuestion(
    new QuizQuestionIdentifier().parse(backendTestIdentifiers.partyStage(10)),
    this.quizId,
    0,
    'Question',
    QuizQuestionType.Multiple,
    20,
    100,
    [],
    { id: this.assetId, mimeType: 'image/webp', uri: 'https://delivery.example.test/quiz/asset.webp' },
  );
  readonly member = new OrganizationMember(
    backendTestIdentifiers.organizationMember(1),
    this.project.organizationId,
    this.userId,
    'Editor',
    OrganizationRole.MEMBER,
    new Date('2026-09-28T00:00:00Z'),
  );
  readonly grant = {
    id: this.assetId,
    mimeType: 'image/webp',
    uri: 'https://delivery.example.test/quiz/asset.webp?X-Amz-Signature=signature',
    expiresAt: '2026-09-28T00:05:00.000Z',
  };
  readonly findQuestion = vi.fn().mockResolvedValue(this.question);
  readonly findQuiz = vi.fn().mockResolvedValue(this.quiz);
  readonly findProject = vi.fn().mockResolvedValue(this.project);
  readonly findMember = vi.fn().mockResolvedValue(this.member);
  readonly issuer = { issue: vi.fn().mockResolvedValue(this.grant) };
  readonly useCase = new GetQuizQuestionMediaAccessUseCase(
    { findById: this.findQuiz } as unknown as QuizManagementRepository,
    { findByMediaAssetId: this.findQuestion } as unknown as QuizQuestionRepository,
    new GameTypeManagementAccessGuard(
      { findById: this.findProject } as unknown as ProjectRepository,
      { findByOrganizationAndUser: this.findMember } as unknown as OrganizationMemberRepository,
    ),
    this.issuer,
  );
}

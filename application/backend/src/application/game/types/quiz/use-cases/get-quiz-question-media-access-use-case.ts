import { Inject, Injectable } from '@nestjs/common';
import { QuizNotFoundError } from '../../../../../domain/game/types/quiz/errors';
import {
  type QuizManagementRepository,
  QuizManagementRepositoryProvider,
} from '../../../../../domain/game/types/quiz/ports/quiz-management.repository';
import {
  type QuizQuestionRepository,
  QuizQuestionRepositoryProvider,
} from '../../../../../domain/game/types/quiz/ports/quiz-question.repository';
import type { UserId } from '../../../../../domain/identity/entities/user';
import { MEDIA_ERROR_DEFINITIONS, MediaErrorCode } from '../../../../../domain/media/enums/media-error-code.enum';
import { type MediaAccessGrant, MediaAccessIssuer } from '../../../../../domain/media/ports/media-access-issuer.port';
import { createDomainError } from '../../../../../domain/shared/errors/domain-error';
import { GameTypeManagementAccessGuard } from '../../shared/services/game-type-management-access-guard';

@Injectable()
export class GetQuizQuestionMediaAccessUseCase {
  constructor(
    @Inject(QuizManagementRepositoryProvider) private readonly quizzes: QuizManagementRepository,
    @Inject(QuizQuestionRepositoryProvider) private readonly questions: QuizQuestionRepository,
    private readonly accessGuard: GameTypeManagementAccessGuard,
    private readonly issuer: MediaAccessIssuer,
  ) {}

  async execute(assetId: string, userId: UserId): Promise<MediaAccessGrant> {
    const question = await this.questions.findByMediaAssetId(assetId);
    if (!question) throw createDomainError(MEDIA_ERROR_DEFINITIONS[MediaErrorCode.MEDIA_UNAVAILABLE], { assetId });
    const quiz = await this.quizzes.findById(question.quizId);
    if (!quiz) throw new QuizNotFoundError({ quizId: question.quizId });
    await this.accessGuard.assertCanManageProject(quiz.projectId, userId);
    return this.issuer.issue(assetId);
  }
}

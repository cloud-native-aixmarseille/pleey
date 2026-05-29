import { Inject, Injectable } from '@nestjs/common';
import type { Quiz } from '../../../../../domain/game/types/quiz/entities/quiz';
import type { QuizManagementRepository } from '../../../../../domain/game/types/quiz/ports/quiz-management.repository';
import { QuizManagementRepositoryProvider } from '../../../../../domain/game/types/quiz/ports/quiz-management.repository';
import type { UserId } from '../../../../../domain/identity/entities/user';
import type { ProjectId } from '../../../../../domain/project/entities/project';
import { GameTypeManagementAccessGuard } from '../../shared/services/game-type-management-access-guard';
import type { PlayableContentImportSource } from '../../shared/services/playable-content-import/import-source';
import { QuizImportQuestionMapper } from '../services/quiz-import-question-mapper';

interface CreateQuizFromImportCommand {
  readonly description: string | null;
  readonly projectId: ProjectId;
  readonly source: PlayableContentImportSource;
  readonly title: string;
}

@Injectable()
export class CreateQuizFromImportUseCase {
  constructor(
    @Inject(QuizManagementRepositoryProvider)
    private readonly quizRepository: QuizManagementRepository,
    private readonly accessGuard: GameTypeManagementAccessGuard,
    private readonly importQuestionMapper: QuizImportQuestionMapper,
  ) {}

  async execute(command: CreateQuizFromImportCommand, userId: UserId): Promise<Quiz> {
    await this.accessGuard.assertCanManageProject(command.projectId, userId);

    const questions = await this.importQuestionMapper.map(command.source);

    return this.quizRepository.createWithQuestions({
      description: command.description,
      projectId: command.projectId,
      questions,
      title: command.title,
    });
  }
}

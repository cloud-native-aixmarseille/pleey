import { Inject, Injectable } from '@nestjs/common';
import type { Quiz } from '../../../../../domain/game/types/quiz/entities/quiz';
import type { QuizManagementRepository } from '../../../../../domain/game/types/quiz/ports/quiz-management.repository';
import { QuizManagementRepositoryProvider } from '../../../../../domain/game/types/quiz/ports/quiz-management.repository';
import type { UserId } from '../../../../../domain/identity/entities/user';
import type { ProjectId } from '../../../../../domain/project/entities/project';
import { GameTypeManagementAccessGuard } from '../../shared/services/game-type-management-access-guard';

interface CreateQuizCommand {
  readonly projectId: ProjectId;
  readonly title: string;
  readonly description: string | null;
}

@Injectable()
export class CreateQuizUseCase {
  constructor(
    @Inject(QuizManagementRepositoryProvider)
    private readonly quizRepository: QuizManagementRepository,
    private readonly accessGuard: GameTypeManagementAccessGuard,
  ) {}

  async execute(command: CreateQuizCommand, userId: UserId): Promise<Quiz> {
    await this.accessGuard.assertCanManageProject(command.projectId, userId);

    return this.quizRepository.create(command);
  }
}

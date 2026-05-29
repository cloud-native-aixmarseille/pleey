import { inject, injectable } from 'inversify';
import type { QuizQuestionId } from '../../../../../domains/game/types/quiz/entities/quiz-question-id';
import {
  type QuizManagementRepository,
  QuizManagementRepositoryToken,
} from '../../../../../domains/game/types/quiz/ports/quiz-management.repository';
import type { GameTypeId } from '../../../../../domains/game/types/shared/game-type';
import type {
  PlayableContentImportInput,
  PlayableContentImportResult,
  PlayableGameMetadataInput,
  PlayableManagementItem,
  PlayableManagementItemInput,
  PlayableManagementState,
} from '../../../../../domains/game/types/shared/management/playable-management';
import type { ProjectId } from '../../../../../domains/project/entities/project';
import type { PlayableContentImportGateway } from '../../shared/contracts/playable-content-import.gateway';
import type { PlayableManagementGateway } from '../../shared/contracts/playable-management.gateway';

@injectable()
export class QuizManagementFacade
  implements PlayableManagementGateway<QuizQuestionId>, PlayableContentImportGateway
{
  constructor(
    @inject(QuizManagementRepositoryToken)
    private readonly repository: QuizManagementRepository,
  ) {}

  createGame(projectId: ProjectId, input: PlayableGameMetadataInput): Promise<GameTypeId> {
    return this.repository.createQuiz(projectId, input);
  }

  load(quizId: GameTypeId): Promise<PlayableManagementState<QuizQuestionId>> {
    return this.repository.load(quizId);
  }

  async updateMetadata(quizId: GameTypeId, input: PlayableGameMetadataInput): Promise<void> {
    await this.repository.updateMetadata(quizId, input);
  }

  async deleteGame(quizId: GameTypeId): Promise<void> {
    await this.repository.deleteQuiz(quizId);
  }

  createItem(
    quizId: GameTypeId,
    input: PlayableManagementItemInput,
  ): Promise<PlayableManagementItem<QuizQuestionId>> {
    return this.repository.createQuestion(quizId, input);
  }

  updateItem(
    itemId: QuizQuestionId,
    input: PlayableManagementItemInput,
  ): Promise<PlayableManagementItem<QuizQuestionId>> {
    return this.repository.updateQuestion(itemId, input);
  }

  async deleteItem(itemId: QuizQuestionId): Promise<void> {
    await this.repository.deleteQuestion(itemId);
  }

  importContent(
    quizId: GameTypeId,
    input: PlayableContentImportInput,
  ): Promise<PlayableContentImportResult> {
    return this.repository.importQuestions(quizId, input);
  }
}

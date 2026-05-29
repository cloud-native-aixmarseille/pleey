import type { ProjectId } from '../../../../project/entities/project';
import type { GameTypeId } from '../../shared/game-type';
import type {
  PlayableContentImportCreationInput,
  PlayableContentImportCreationResult,
  PlayableGameMetadataInput,
  PlayableManagementItem,
  PlayableManagementItemInput,
  PlayableManagementState,
} from '../../shared/management/playable-management';
import type { QuizQuestionId } from '../entities/quiz-question-id';

export interface QuizManagementRepository {
  createQuiz(projectId: ProjectId, input: PlayableGameMetadataInput): Promise<GameTypeId>;
  createQuizFromImport(
    projectId: ProjectId,
    input: PlayableContentImportCreationInput,
  ): Promise<PlayableContentImportCreationResult>;
  load(quizId: GameTypeId): Promise<PlayableManagementState<QuizQuestionId>>;
  updateMetadata(quizId: GameTypeId, input: PlayableGameMetadataInput): Promise<void>;
  deleteQuiz(quizId: GameTypeId): Promise<void>;
  createQuestion(
    quizId: GameTypeId,
    input: PlayableManagementItemInput,
  ): Promise<PlayableManagementItem<QuizQuestionId>>;
  updateQuestion(
    questionId: QuizQuestionId,
    input: PlayableManagementItemInput,
  ): Promise<PlayableManagementItem<QuizQuestionId>>;
  deleteQuestion(questionId: QuizQuestionId): Promise<void>;
}

export const QuizManagementRepositoryToken = Symbol.for('QuizManagementRepository');

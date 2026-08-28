import type { ProjectId } from '../../../../project/entities/project';
import type { GameId } from '../../../entities/game';
import type { GameTypeId } from '../../shared/entities/game-type';
import type { Quiz, QuizId } from '../entities/quiz';
import type { QuizQuestionCreationData } from './quiz-question.repository';

export const QuizManagementRepositoryProvider = Symbol('QuizManagementRepository');

export interface CreateQuizData {
  readonly projectId: ProjectId;
  readonly title: string;
  readonly description: string | null;
}

export interface CreateQuizWithQuestionsData extends CreateQuizData {
  readonly questions: readonly QuizQuestionCreationData[];
}

export interface UpdateQuizData {
  readonly title: string;
  readonly description: string | null;
}

export interface QuizManagementRepository {
  create(data: CreateQuizData): Promise<Quiz>;
  createWithQuestions(data: CreateQuizWithQuestionsData): Promise<Quiz>;
  findById(id: GameTypeId): Promise<Quiz | null>;
  update(id: QuizId, data: UpdateQuizData): Promise<Quiz>;
  delete(id: QuizId): Promise<void>;
  hasActiveParty(gameId: GameId): Promise<boolean>;
}

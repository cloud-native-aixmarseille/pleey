import { inject, injectable } from 'inversify';
import { GameIdentifier } from '../../../../application/game/shared/services/identifiers/game-identifier';
import { QuizQuestionIdentifier } from '../../../../application/game/types/quiz/services/quiz-question-identifier';
import { GameTypeIdentifier } from '../../../../application/game/types/shared/services/game-type-identifier';
import type { QuizQuestionId } from '../../../../domains/game/types/quiz/entities/quiz-question-id';
import type { QuizQuestionKind } from '../../../../domains/game/types/quiz/entities/quiz-question-kind';
import type { QuizManagementRepository } from '../../../../domains/game/types/quiz/ports/quiz-management.repository';
import type { GameTypeId } from '../../../../domains/game/types/shared/game-type';
import type {
  PlayableGameMetadataInput,
  PlayableManagementItem,
  PlayableManagementItemInput,
  PlayableManagementState,
} from '../../../../domains/game/types/shared/management/playable-management';
import type { ProjectId } from '../../../../domains/project/entities/project';
import { GraphqlClient } from '../../../graphql/client/graphql-client';
import {
  CreateQuizManagementDocument,
  CreateQuizQuestionManagementDocument,
  type CreateQuizQuestionManagementMutation,
  DeleteQuizManagementDocument,
  DeleteQuizQuestionManagementDocument,
  QuizManagementDocument,
  type QuizManagementQuery,
  QuizQuestionType,
  UpdateQuizManagementDocument,
  UpdateQuizQuestionManagementDocument,
  type UpdateQuizQuestionManagementMutation,
} from '../../../graphql/generated/graphql';
import { PlayableManagementGraphqlMapper } from '../shared/playable-management-graphql.mapper';

type GraphqlQuizQuestion =
  | QuizManagementQuery['quizQuestions'][number]
  | NonNullable<CreateQuizQuestionManagementMutation['createQuizQuestion']>
  | NonNullable<UpdateQuizQuestionManagementMutation['updateQuizQuestion']>;

@injectable()
export class GraphqlQuizManagementRepository implements QuizManagementRepository {
  constructor(
    @inject(GraphqlClient)
    private readonly graphqlClient: GraphqlClient,
    @inject(GameIdentifier)
    private readonly gameIdentifier: GameIdentifier,
    @inject(GameTypeIdentifier)
    private readonly gameTypeIdentifier: GameTypeIdentifier,
    @inject(QuizQuestionIdentifier)
    private readonly quizQuestionIdentifier: QuizQuestionIdentifier,
    @inject(PlayableManagementGraphqlMapper)
    private readonly mapper: PlayableManagementGraphqlMapper,
  ) {}

  async createQuiz(projectId: ProjectId, input: PlayableGameMetadataInput): Promise<GameTypeId> {
    const result = await this.graphqlClient.request(CreateQuizManagementDocument, {
      input: { ...input, projectId },
    });

    if (!result.createQuiz) {
      throw new Error('Quiz creation did not return a quiz');
    }

    return this.gameTypeIdentifier.parse(result.createQuiz.quizId);
  }

  async load(quizId: GameTypeId): Promise<PlayableManagementState<QuizQuestionId>> {
    const result = await this.graphqlClient.request(QuizManagementDocument, { quizId });
    const gameTypeId = this.gameTypeIdentifier.parse(result.quiz.quizId);

    return {
      game: this.mapper.mapGame({
        gameTypeId,
        gameId: this.gameIdentifier.parse(result.quiz.gameId),
        title: result.quiz.title,
        description: result.quiz.description,
        createdAt: result.quiz.createdAt,
        itemCount: result.quiz.questionCount,
      }),
      items: result.quizQuestions.map((question) =>
        this.mapper.mapItem({
          id: this.quizQuestionIdentifier.parse(question.id),
          gameTypeId,
          position: question.position,
          text: question.questionText,
          kind: question.type,
          timeLimit: question.timeLimit,
          points: question.points,
          options: question.answers,
        }),
      ),
    };
  }

  async updateMetadata(quizId: GameTypeId, input: PlayableGameMetadataInput): Promise<void> {
    await this.graphqlClient.request(UpdateQuizManagementDocument, { quizId, input });
  }

  async deleteQuiz(quizId: GameTypeId): Promise<void> {
    await this.graphqlClient.request(DeleteQuizManagementDocument, { quizId });
  }

  async createQuestion(
    quizId: GameTypeId,
    input: PlayableManagementItemInput,
  ): Promise<PlayableManagementItem<QuizQuestionId>> {
    const mappedInput = this.mapper.mapItemInput(input);
    const result = await this.graphqlClient.request(CreateQuizQuestionManagementDocument, {
      input: {
        quizId,
        position: mappedInput.position,
        questionText: input.text,
        type: this.toGraphqlQuestionKind(input.kind),
        timeLimit: mappedInput.timeLimit,
        points: mappedInput.points,
        answers: mappedInput.options,
      },
    });

    return this.mapMutationQuestion(result.createQuizQuestion);
  }

  async updateQuestion(
    questionId: QuizQuestionId,
    input: PlayableManagementItemInput,
  ): Promise<PlayableManagementItem<QuizQuestionId>> {
    const mappedInput = this.mapper.mapItemInput(input);
    const result = await this.graphqlClient.request(UpdateQuizQuestionManagementDocument, {
      questionId,
      input: {
        position: mappedInput.position,
        questionText: input.text,
        type: this.toGraphqlQuestionKind(input.kind),
        timeLimit: mappedInput.timeLimit,
        points: mappedInput.points,
        answers: mappedInput.options,
      },
    });

    return this.mapMutationQuestion(result.updateQuizQuestion);
  }

  async deleteQuestion(questionId: QuizQuestionId): Promise<void> {
    await this.graphqlClient.request(DeleteQuizQuestionManagementDocument, { questionId });
  }

  private mapMutationQuestion(
    question: GraphqlQuizQuestion | null | undefined,
  ): PlayableManagementItem<QuizQuestionId> {
    if (!question) {
      throw new Error('Quiz question mutation did not return a question');
    }

    return this.mapper.mapItem({
      id: this.quizQuestionIdentifier.parse(question.id),
      gameTypeId: this.gameTypeIdentifier.parse(question.quizId),
      position: question.position,
      text: question.questionText,
      kind: this.fromGraphqlQuestionKind(question.type),
      timeLimit: question.timeLimit,
      points: question.points,
      options: question.answers,
    });
  }

  private toGraphqlQuestionKind(kind: string | undefined): QuizQuestionType {
    return kind === 'truefalse' ? QuizQuestionType.TrueFalse : QuizQuestionType.Multiple;
  }

  private fromGraphqlQuestionKind(kind: QuizQuestionType): QuizQuestionKind {
    return kind === QuizQuestionType.TrueFalse ? 'truefalse' : 'multiple';
  }
}

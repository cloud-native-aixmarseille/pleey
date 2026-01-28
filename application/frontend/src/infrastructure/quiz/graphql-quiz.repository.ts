import { inject, injectable } from 'inversify';
import type { Quiz } from '../../domains/quiz/entities/quiz';
import type {
  CreateQuizQuestionInput,
  UpdateQuizInput,
  UpdateQuizQuestionInput,
} from '../../domains/quiz/entities/quiz-management-input';
import { type QuizQuestion, QuizQuestionType } from '../../domains/quiz/entities/quiz-question';
import { QuizErrorCode } from '../../domains/quiz/errors/quiz-error-code';
import type { QuizRepository } from '../../domains/quiz/ports/quiz-repository';
import { GraphqlClient } from '../graphql/client/graphql-client';
import {
  CreateQuestionDocument,
  type CreateQuestionMutation,
  type CreateQuestionMutationVariables,
  DashboardQuizzesByProjectDocument,
  type DashboardQuizzesByProjectQuery,
  type DashboardQuizzesByProjectQueryVariables,
  DeleteQuestionDocument,
  type DeleteQuestionMutation,
  type DeleteQuestionMutationVariables,
  QuestionType,
  QuizQuestionsDocument,
  type QuizQuestionsQuery,
  type QuizQuestionsQueryVariables,
  UpdateQuestionDocument,
  type UpdateQuestionMutation,
  type UpdateQuestionMutationVariables,
  UpdateQuizDocument,
  type UpdateQuizMutation,
  type UpdateQuizMutationVariables,
} from '../graphql/generated/graphql';

@injectable()
export class GraphqlQuizRepository implements QuizRepository {
  constructor(
    @inject(GraphqlClient)
    private readonly graphqlClient: GraphqlClient,
  ) {}

  async getQuizById(quizId: number): Promise<Quiz | null> {
    try {
      const result = await this.graphqlClient.request<
        DashboardQuizzesByProjectQuery,
        DashboardQuizzesByProjectQueryVariables
      >(DashboardQuizzesByProjectDocument);

      return (
        (result.quizzes ?? [])
          .map((quiz) => this.toQuiz(quiz))
          .find((quiz) => quiz.id === quizId) ?? null
      );
    } catch (error) {
      throw new Error(this.graphqlClient.extractMessage(error, QuizErrorCode.LOAD_FAILED));
    }
  }

  async getQuizzesByProject(projectId: number): Promise<Quiz[]> {
    try {
      const result = await this.graphqlClient.request<
        DashboardQuizzesByProjectQuery,
        DashboardQuizzesByProjectQueryVariables
      >(DashboardQuizzesByProjectDocument, { projectId });

      return (result.quizzes ?? []).map((quiz) => this.toQuiz(quiz));
    } catch (error) {
      throw new Error(this.graphqlClient.extractMessage(error, QuizErrorCode.LOAD_FAILED));
    }
  }

  async getQuizQuestions(quizId: number): Promise<QuizQuestion[]> {
    try {
      const result = await this.graphqlClient.request<
        QuizQuestionsQuery,
        QuizQuestionsQueryVariables
      >(QuizQuestionsDocument, { quizId });

      return (result.quizQuestions ?? []).map((question) => this.toQuestion(question));
    } catch (error) {
      throw new Error(this.graphqlClient.extractMessage(error, QuizErrorCode.QUESTION_LOAD_FAILED));
    }
  }

  async updateQuiz(quizId: number, input: UpdateQuizInput): Promise<Quiz> {
    try {
      const result = await this.graphqlClient.request<
        UpdateQuizMutation,
        UpdateQuizMutationVariables
      >(UpdateQuizDocument, {
        quizId,
        input: {
          title: input.title,
          description: input.description,
        },
      });

      return this.toQuiz(result.updateQuiz);
    } catch (error) {
      throw new Error(this.graphqlClient.extractMessage(error, QuizErrorCode.UPDATE_FAILED));
    }
  }

  async createQuizQuestion(input: CreateQuizQuestionInput): Promise<QuizQuestion> {
    try {
      const result = await this.graphqlClient.request<
        CreateQuestionMutation,
        CreateQuestionMutationVariables
      >(CreateQuestionDocument, {
        input: {
          quizId: input.quizId,
          position: input.position,
          questionText: input.questionText,
          type: this.toGraphqlQuestionType(input.type),
          answers: input.answers.map((answer) => ({
            id: answer.id,
            text: answer.text,
            position: answer.position,
            isCorrect: answer.isCorrect,
          })),
          timeLimit: input.timeLimit,
          points: input.points,
        },
      });

      return this.toQuestion(result.createQuestion);
    } catch (error) {
      throw new Error(
        this.graphqlClient.extractMessage(error, QuizErrorCode.QUESTION_CREATE_FAILED),
      );
    }
  }

  async updateQuizQuestion(
    questionId: number,
    input: UpdateQuizQuestionInput,
  ): Promise<QuizQuestion> {
    try {
      const result = await this.graphqlClient.request<
        UpdateQuestionMutation,
        UpdateQuestionMutationVariables
      >(UpdateQuestionDocument, {
        questionId,
        input: {
          quizId: input.quizId,
          position: input.position,
          questionText: input.questionText,
          type: input.type ? this.toGraphqlQuestionType(input.type) : undefined,
          answers: input.answers?.map((answer) => ({
            id: answer.id,
            text: answer.text,
            position: answer.position,
            isCorrect: answer.isCorrect,
          })),
          timeLimit: input.timeLimit,
          points: input.points,
        },
      });

      return this.toQuestion(result.updateQuestion);
    } catch (error) {
      throw new Error(
        this.graphqlClient.extractMessage(error, QuizErrorCode.QUESTION_UPDATE_FAILED),
      );
    }
  }

  async deleteQuizQuestion(questionId: number): Promise<void> {
    try {
      await this.graphqlClient.request<DeleteQuestionMutation, DeleteQuestionMutationVariables>(
        DeleteQuestionDocument,
        { questionId },
      );
    } catch (error) {
      throw new Error(
        this.graphqlClient.extractMessage(error, QuizErrorCode.QUESTION_DELETE_FAILED),
      );
    }
  }

  private toQuiz(quiz: {
    readonly id: number;
    readonly gameId: number;
    readonly title: string;
    readonly description?: string | null;
    readonly createdAt: string;
    readonly questionCount: number;
  }): Quiz {
    return {
      id: quiz.id,
      gameId: quiz.gameId,
      title: quiz.title,
      description: quiz.description ?? null,
      createdAt: quiz.createdAt,
      questionCount: quiz.questionCount,
    };
  }

  private toQuestion(question: {
    readonly id: number;
    readonly quizId: number;
    readonly position: number;
    readonly questionText: string;
    readonly type: QuestionType;
    readonly answers: readonly {
      readonly id: number;
      readonly text?: string | null;
      readonly position: number;
      readonly isCorrect: boolean;
    }[];
    readonly timeLimit: number;
    readonly points: number;
  }): QuizQuestion {
    return {
      id: question.id,
      quizId: question.quizId,
      position: question.position,
      questionText: question.questionText,
      type: this.fromGraphqlQuestionType(question.type),
      answers: question.answers.map((answer) => ({
        id: answer.id,
        text: answer.text ?? null,
        position: answer.position,
        isCorrect: answer.isCorrect,
      })),
      timeLimit: question.timeLimit,
      points: question.points,
    };
  }

  private toGraphqlQuestionType(type: QuizQuestionType): QuestionType {
    return type === QuizQuestionType.MULTIPLE ? QuestionType.Multiple : QuestionType.TrueFalse;
  }

  private fromGraphqlQuestionType(type: QuestionType): QuizQuestionType {
    return type === QuestionType.Multiple ? QuizQuestionType.MULTIPLE : QuizQuestionType.TRUE_FALSE;
  }
}

import { Inject, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateQuestionUseCase } from '../../../application/quiz-management/use-cases/create-question-use-case';
import { CreateQuizUseCase } from '../../../application/quiz-management/use-cases/create-quiz-use-case';
import { DeleteQuestionUseCase } from '../../../application/quiz-management/use-cases/delete-question-use-case';
import { DeleteQuizUseCase } from '../../../application/quiz-management/use-cases/delete-quiz-use-case';
import { ListQuizQuestionsUseCase } from '../../../application/quiz-management/use-cases/list-quiz-questions-use-case';
import { ListQuizzesUseCase } from '../../../application/quiz-management/use-cases/list-quizzes-use-case';
import { UpdateQuestionUseCase } from '../../../application/quiz-management/use-cases/update-question-use-case';
import { UpdateQuizUseCase } from '../../../application/quiz-management/use-cases/update-quiz-use-case';
import type { UserId } from '../../../domain/auth/entities/user';
import { AuthErrorCode } from '../../../domain/auth/enums/auth-error-code.enum';
import {
  type GameRepository,
  GameRepositoryProvider,
} from '../../../domain/game/ports/repositories/game.repository';
import { QuestionType } from '../../../domain/quiz/entities/question';
import { GqlJwtAuthGuard } from '../../identity/shared/guards/gql-jwt-auth-guard';
import { CreateQuestionInput, UpdateQuestionInput } from './types/question.input';
import { CreateQuizInput, UpdateQuizInput } from './types/quiz.input';
import { QuestionTypeGql, QuizType } from './types/quiz.type';

type GraphqlAuthContext = {
  req?: {
    user?: {
      id: UserId;
    };
  };
  user?: {
    id: UserId;
  };
};

@Resolver()
export class QuizResolver {
  constructor(
    @Inject(GameRepositoryProvider)
    private readonly gameRepository: GameRepository,
    private readonly createQuizUseCase: CreateQuizUseCase,
    private readonly deleteQuizUseCase: DeleteQuizUseCase,
    private readonly listQuizzesUseCase: ListQuizzesUseCase,
    private readonly listQuizQuestionsUseCase: ListQuizQuestionsUseCase,
    private readonly updateQuizUseCase: UpdateQuizUseCase,
    private readonly createQuestionUseCase: CreateQuestionUseCase,
    private readonly updateQuestionUseCase: UpdateQuestionUseCase,
    private readonly deleteQuestionUseCase: DeleteQuestionUseCase,
  ) {}

  @Mutation(() => QuizType)
  @UseGuards(GqlJwtAuthGuard)
  async createQuiz(
    @Context() context: GraphqlAuthContext,
    @Args('input') input: CreateQuizInput,
  ): Promise<QuizType> {
    const userId = this.resolveUserId(context);
    const quiz = await this.createQuizUseCase.execute(input, userId);
    return this.mapQuiz(quiz);
  }

  @Query(() => [QuizType])
  async quizzes(
    @Args('projectId', { type: () => Int, nullable: true }) projectId?: number,
  ): Promise<QuizType[]> {
    const quizList = await this.listQuizzesUseCase.execute(projectId);
    return Promise.all(quizList.map((quiz) => this.mapQuiz(quiz)));
  }

  @Query(() => [QuestionTypeGql])
  async quizQuestions(
    @Args('quizId', { type: () => Int }) quizId: number,
  ): Promise<QuestionTypeGql[]> {
    const questions = await this.listQuizQuestionsUseCase.execute(quizId);
    return questions.map((question) => this.mapQuestion(question));
  }

  @Mutation(() => QuizType)
  @UseGuards(GqlJwtAuthGuard)
  async updateQuiz(
    @Args('quizId', { type: () => Int }) quizId: number,
    @Args('input') input: UpdateQuizInput,
  ): Promise<QuizType> {
    const quiz = await this.updateQuizUseCase.execute(quizId, input);
    return this.mapQuiz(quiz);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtAuthGuard)
  async deleteQuiz(@Args('quizId', { type: () => Int }) quizId: number): Promise<boolean> {
    await this.deleteQuizUseCase.execute(quizId);
    return true;
  }

  @Mutation(() => QuestionTypeGql)
  @UseGuards(GqlJwtAuthGuard)
  async createQuestion(@Args('input') input: CreateQuestionInput): Promise<QuestionTypeGql> {
    const question = await this.createQuestionUseCase.execute(input);
    return this.mapQuestion(question);
  }

  @Mutation(() => QuestionTypeGql)
  @UseGuards(GqlJwtAuthGuard)
  async updateQuestion(
    @Args('questionId', { type: () => Int }) questionId: number,
    @Args('input') input: UpdateQuestionInput,
  ): Promise<QuestionTypeGql> {
    const question = await this.updateQuestionUseCase.execute(questionId, input);
    return this.mapQuestion(question);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtAuthGuard)
  async deleteQuestion(
    @Args('questionId', { type: () => Int }) questionId: number,
  ): Promise<boolean> {
    await this.deleteQuestionUseCase.execute(questionId);
    return true;
  }

  private async mapQuiz(quiz: {
    id: number;
    gameId: number;
    createdAt: Date;
    questionCount: number;
  }): Promise<QuizType> {
    const game = await this.gameRepository.findById(quiz.gameId);

    return {
      id: quiz.id,
      gameId: quiz.gameId,
      title: game?.title ?? '',
      description: game?.description ?? null,
      createdAt: quiz.createdAt,
      questionCount: quiz.questionCount,
    };
  }

  private mapQuestion(question: {
    id: number;
    quizId: number;
    position: number;
    questionText: string;
    type: QuestionType;
    answers: Array<{
      id: number;
      text: string | null;
      position: number;
      isCorrect: boolean;
    }>;
    timeLimit: number;
    points: number;
  }): QuestionTypeGql {
    return {
      id: question.id,
      quizId: question.quizId,
      position: question.position,
      questionText: question.questionText,
      type: question.type,
      answers: question.answers,
      timeLimit: question.timeLimit,
      points: question.points,
    };
  }

  private resolveUserId(context: GraphqlAuthContext): UserId {
    const userId = context.req?.user?.id ?? context.user?.id;

    if (!userId) {
      throw new UnauthorizedException(AuthErrorCode.UNAUTHORIZED);
    }

    return userId;
  }
}

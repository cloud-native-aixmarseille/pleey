import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { QuizQuestionIdentifier } from '../../../../../application/game/types/quiz/services/quiz-question-identifier';
import { QuizSelectableOptionIdentifier } from '../../../../../application/game/types/quiz/services/quiz-selectable-option-identifier';
import { CreateQuizQuestionUseCase } from '../../../../../application/game/types/quiz/use-cases/create-quiz-question-use-case';
import { CreateQuizUseCase } from '../../../../../application/game/types/quiz/use-cases/create-quiz-use-case';
import { DeleteQuizQuestionUseCase } from '../../../../../application/game/types/quiz/use-cases/delete-quiz-question-use-case';
import { DeleteQuizUseCase } from '../../../../../application/game/types/quiz/use-cases/delete-quiz-use-case';
import { GetQuizUseCase } from '../../../../../application/game/types/quiz/use-cases/get-quiz-use-case';
import { ListQuizQuestionsUseCase } from '../../../../../application/game/types/quiz/use-cases/list-quiz-questions-use-case';
import { UpdateQuizQuestionUseCase } from '../../../../../application/game/types/quiz/use-cases/update-quiz-question-use-case';
import { UpdateQuizUseCase } from '../../../../../application/game/types/quiz/use-cases/update-quiz-use-case';
import { GameTypeIdentifier } from '../../../../../application/game/types/shared/services/game-type-identifier';
import { ProjectIdentifier } from '../../../../../application/workspace/shared/services/identifiers/project-identifier';
import type { Quiz } from '../../../../../domain/game/types/quiz/entities/quiz';
import type { QuizQuestion } from '../../../../../domain/game/types/quiz/entities/quiz-question';
import { GameType } from '../../../../../domain/game/types/shared/entities/game-type';
import type { UserId } from '../../../../../domain/identity/entities/user';
import { IdentityErrorCode } from '../../../../../domain/identity/enums/identity-error-code.enum';
import { GqlJwtAuthGuard } from '../../../../identity/shared/guards/gql-jwt-auth-guard';
import { SelectableOptionInputMapper } from '../../shared/graphql/selectable-option-input-mapper';
import {
  CreateQuizInput,
  CreateQuizQuestionInput,
  UpdateQuizInput,
  UpdateQuizQuestionInput,
} from './types/quiz-inputs';
import { QuizQuestionTypeObject, QuizType } from './types/quiz-types';

type GraphqlAuthContext = {
  req?: { user?: { id: UserId } };
  user?: { id: UserId };
};

@Resolver()
export class QuizManagementResolver {
  constructor(
    private readonly createQuizUseCase: CreateQuizUseCase,
    private readonly updateQuizUseCase: UpdateQuizUseCase,
    private readonly deleteQuizUseCase: DeleteQuizUseCase,
    private readonly getQuizUseCase: GetQuizUseCase,
    private readonly createQuizQuestionUseCase: CreateQuizQuestionUseCase,
    private readonly listQuizQuestionsUseCase: ListQuizQuestionsUseCase,
    private readonly updateQuizQuestionUseCase: UpdateQuizQuestionUseCase,
    private readonly deleteQuizQuestionUseCase: DeleteQuizQuestionUseCase,
    private readonly gameTypeIdentifier: GameTypeIdentifier,
    private readonly quizQuestionIdentifier: QuizQuestionIdentifier,
    private readonly quizSelectableOptionIdentifier: QuizSelectableOptionIdentifier,
    private readonly selectableOptionInputMapper: SelectableOptionInputMapper,
    private readonly projectIdentifier: ProjectIdentifier,
  ) {}

  @Query(() => QuizType)
  @UseGuards(GqlJwtAuthGuard)
  async quiz(
    @Args('quizId', { type: () => Int }) quizId: number,
    @Context() context: GraphqlAuthContext,
  ): Promise<QuizType> {
    const quiz = await this.getQuizUseCase.execute(
      this.gameTypeIdentifier.parse(quizId),
      this.resolveUserId(context),
    );

    return this.mapQuiz(quiz);
  }

  @Mutation(() => QuizType)
  @UseGuards(GqlJwtAuthGuard)
  async createQuiz(
    @Args('input') input: CreateQuizInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<QuizType> {
    const quiz = await this.createQuizUseCase.execute(
      {
        projectId: this.projectIdentifier.parse(input.projectId),
        title: input.title,
        description: input.description ?? null,
      },
      this.resolveUserId(context),
    );

    return this.mapQuiz(quiz);
  }

  @Mutation(() => QuizType)
  @UseGuards(GqlJwtAuthGuard)
  async updateQuiz(
    @Args('quizId', { type: () => Int }) quizId: number,
    @Args('input') input: UpdateQuizInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<QuizType> {
    const quiz = await this.updateQuizUseCase.execute(
      {
        quizId: this.gameTypeIdentifier.parse(quizId),
        title: input.title,
        description: input.description ?? null,
      },
      this.resolveUserId(context),
    );

    return this.mapQuiz(quiz);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtAuthGuard)
  async deleteQuiz(
    @Args('quizId', { type: () => Int }) quizId: number,
    @Context() context: GraphqlAuthContext,
  ): Promise<boolean> {
    return this.deleteQuizUseCase.execute(
      this.gameTypeIdentifier.parse(quizId),
      this.resolveUserId(context),
    );
  }

  @Query(() => [QuizQuestionTypeObject])
  @UseGuards(GqlJwtAuthGuard)
  async quizQuestions(
    @Args('quizId', { type: () => Int }) quizId: number,
    @Context() context: GraphqlAuthContext,
  ): Promise<QuizQuestionTypeObject[]> {
    const questions = await this.listQuizQuestionsUseCase.execute(
      this.gameTypeIdentifier.parse(quizId),
      this.resolveUserId(context),
    );

    return questions.map((question) => this.mapQuestion(question));
  }

  @Mutation(() => QuizQuestionTypeObject)
  @UseGuards(GqlJwtAuthGuard)
  async createQuizQuestion(
    @Args('input') input: CreateQuizQuestionInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<QuizQuestionTypeObject> {
    const question = await this.createQuizQuestionUseCase.execute(
      {
        quizId: this.gameTypeIdentifier.parse(input.quizId),
        position: input.position,
        questionText: input.questionText,
        type: input.type,
        timeLimit: input.timeLimit,
        points: input.points,
        answers: this.selectableOptionInputMapper.toDomainInputs(
          input.answers,
          this.quizSelectableOptionIdentifier,
        ),
      },
      this.resolveUserId(context),
    );

    return this.mapQuestion(question);
  }

  @Mutation(() => QuizQuestionTypeObject)
  @UseGuards(GqlJwtAuthGuard)
  async updateQuizQuestion(
    @Args('questionId', { type: () => Int }) questionId: number,
    @Args('input') input: UpdateQuizQuestionInput,
    @Context() context: GraphqlAuthContext,
  ): Promise<QuizQuestionTypeObject> {
    const question = await this.updateQuizQuestionUseCase.execute(
      {
        questionId: this.quizQuestionIdentifier.parse(questionId),
        position: input.position,
        questionText: input.questionText,
        type: input.type,
        timeLimit: input.timeLimit,
        points: input.points,
        answers: this.selectableOptionInputMapper.toDomainInputs(
          input.answers,
          this.quizSelectableOptionIdentifier,
        ),
      },
      this.resolveUserId(context),
    );

    return this.mapQuestion(question);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtAuthGuard)
  async deleteQuizQuestion(
    @Args('questionId', { type: () => Int }) questionId: number,
    @Context() context: GraphqlAuthContext,
  ): Promise<boolean> {
    return this.deleteQuizQuestionUseCase.execute(
      this.quizQuestionIdentifier.parse(questionId),
      this.resolveUserId(context),
    );
  }

  private mapQuiz(quiz: Quiz): QuizType {
    return {
      quizId: quiz.id,
      gameId: quiz.gameId,
      type: GameType.Quiz,
      title: quiz.title,
      description: quiz.description,
      createdAt: quiz.createdAt,
      questionCount: quiz.questionCount,
    };
  }

  private mapQuestion(question: QuizQuestion): QuizQuestionTypeObject {
    return {
      id: question.id,
      quizId: question.quizId,
      position: question.position,
      questionText: question.questionText,
      type: question.type,
      timeLimit: question.timeLimit,
      points: question.points,
      answers: question.answers.map((answer) => ({
        id: answer.id,
        text: answer.text,
        position: answer.position,
        isCorrect: answer.isCorrect,
      })),
    };
  }

  private resolveUserId(context: GraphqlAuthContext): UserId {
    const userId = context.req?.user?.id ?? context.user?.id;

    if (!userId) {
      throw new UnauthorizedException(IdentityErrorCode.UNAUTHORIZED);
    }

    return userId;
  }
}

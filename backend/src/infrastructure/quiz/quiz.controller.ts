import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { CreateQuizDto } from '../../application/quiz/dto/create-quiz.dto';
import { CreateQuizUseCase } from '../../application/quiz/use-cases/create-quiz.use-case';
import { GetAllQuizzesUseCase } from '../../application/quiz/use-cases/get-all-quizzes.use-case';
import { GetQuizQuestionsUseCase } from '../../application/quiz/use-cases/get-quiz-questions.use-case';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QuizErrorCode } from '../../application/quiz/enums/quiz-error-code.enum';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    isAdmin: boolean;
    avatarUrl: string | null;
  };
}

@Controller('quizzes')
export class QuizController {
  constructor(
    private readonly createQuizUseCase: CreateQuizUseCase,
    private readonly getAllQuizzesUseCase: GetAllQuizzesUseCase,
    private readonly getQuizQuestionsUseCase: GetQuizQuestionsUseCase,
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateQuizDto, @Req() request: AuthenticatedRequest) {
    const user = request.user;
    if (!user) {
      throw new ForbiddenException(QuizErrorCode.AUTHENTICATION_REQUIRED);
    }

    if (!user.isAdmin) {
      throw new ForbiddenException(QuizErrorCode.ADMIN_PRIVILEGES_REQUIRED);
    }

    const quiz = await this.createQuizUseCase.execute(dto, user.id);
    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      createdById: quiz.createdById,
      createdAt: quiz.createdAt,
    };
  }

  @Get()
  async findAll() {
    const quizzes = await this.getAllQuizzesUseCase.execute();
    return quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      createdById: quiz.createdById,
      createdAt: quiz.createdAt,
    }));
  }

  @Get(':quizId/questions')
  async findQuestions(@Param('quizId', ParseIntPipe) quizId: number) {
    const questions = await this.getQuizQuestionsUseCase.execute(quizId);

    return questions.map((question) => ({
      id: question.id,
      quiz_id: question.quizId,
      question_text: question.questionText,
      type: question.type,
      correct_answer: question.correctAnswer,
      option_a: question.optionA,
      option_b: question.optionB,
      option_c: question.optionC,
      option_d: question.optionD,
      time_limit: question.timeLimit,
      points: question.points,
    }));
  }
}

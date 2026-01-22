import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateQuizDto } from '../../application/quiz/dto/create-quiz.dto';
import { UpdateQuizDto } from '../../application/quiz/dto/update-quiz.dto';
import { CreateQuizUseCase } from '../../application/quiz/use-cases/create-quiz.use-case';
import { DeleteQuizUseCase } from '../../application/quiz/use-cases/delete-quiz.use-case';
import { GetAllQuizzesUseCase } from '../../application/quiz/use-cases/get-all-quizzes.use-case';
import { GetQuizQuestionsUseCase } from '../../application/quiz/use-cases/get-quiz-questions.use-case';
import { UpdateQuizUseCase } from '../../application/quiz/use-cases/update-quiz.use-case';
import { AppRole } from '../../domain/auth/enums/app-role.enum';
import type { QuizId } from '../../domain/quiz/entities/quiz';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { mapQuestionToResponse } from '../shared/mappers/question-response.mapper';

@Controller('quizzes')
export class QuizController {
  constructor(
    private readonly createQuizUseCase: CreateQuizUseCase,
    private readonly deleteQuizUseCase: DeleteQuizUseCase,
    private readonly getAllQuizzesUseCase: GetAllQuizzesUseCase,
    private readonly getQuizQuestionsUseCase: GetQuizQuestionsUseCase,
    private readonly updateQuizUseCase: UpdateQuizUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.ADMIN)
  async create(@Body() dto: CreateQuizDto, @Req() request: AuthenticatedRequest) {
    const user = request.user;

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
      questionCount: quiz.questionCount,
    }));
  }

  @Get(':quizId/questions')
  async findQuestions(@Param('quizId', ParseIntPipe) quizId: QuizId) {
    const questions = await this.getQuizQuestionsUseCase.execute(quizId);

    return questions.map(mapQuestionToResponse);
  }

  @Delete(':quizId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.ADMIN)
  async delete(@Param('quizId', ParseIntPipe) quizId: QuizId): Promise<void> {
    await this.deleteQuizUseCase.execute(quizId);
  }

  @Patch(':quizId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.ADMIN)
  async update(@Param('quizId', ParseIntPipe) quizId: QuizId, @Body() dto: UpdateQuizDto) {
    const quiz = await this.updateQuizUseCase.execute(quizId, dto);
    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      createdById: quiz.createdById,
      createdAt: quiz.createdAt,
      questionCount: quiz.questionCount,
    };
  }
}

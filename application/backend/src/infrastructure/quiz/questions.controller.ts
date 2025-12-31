import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import type { CreateQuestionDto } from '../../application/quiz/dto/create-question.dto';
import type { UpdateQuestionDto } from '../../application/quiz/dto/update-question.dto';
import { QuizErrorCode } from '../../application/quiz/enums/quiz-error-code.enum';
import { CreateQuestionUseCase } from '../../application/quiz/use-cases/create-question.use-case';
import { DeleteQuestionUseCase } from '../../application/quiz/use-cases/delete-question.use-case';
import { UpdateQuestionUseCase } from '../../application/quiz/use-cases/update-question.use-case';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateQuestionRequestDto } from './dto/create-question.request.dto';
import { UpdateQuestionRequestDto } from './dto/update-question.request.dto';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    isAdmin: boolean;
    avatarUrl: string | null;
  };
}

function mapQuestionToResponse(question: {
  id: number;
  quizId: number;
  questionText: string;
  type: 'multiple' | 'truefalse';
  correctAnswer: string;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  timeLimit: number;
  points: number;
}) {
  return {
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
  };
}

@Controller('questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(
    private readonly createQuestionUseCase: CreateQuestionUseCase,
    private readonly updateQuestionUseCase: UpdateQuestionUseCase,
    private readonly deleteQuestionUseCase: DeleteQuestionUseCase,
  ) {}

  private ensureAdmin(request: AuthenticatedRequest) {
    const user = request.user;
    if (!user) {
      throw new ForbiddenException(QuizErrorCode.AUTHENTICATION_REQUIRED);
    }
    if (!user.isAdmin) {
      throw new ForbiddenException(QuizErrorCode.ADMIN_PRIVILEGES_REQUIRED);
    }
  }

  @Post()
  async create(@Body() dto: CreateQuestionRequestDto, @Req() request: AuthenticatedRequest) {
    this.ensureAdmin(request);

    const payload: CreateQuestionDto = {
      quizId: dto.quizId,
      questionText: dto.questionText,
      type: dto.type,
      correctAnswer: dto.correctAnswer,
      optionA: dto.optionA ?? null,
      optionB: dto.optionB ?? null,
      optionC: dto.optionC ?? null,
      optionD: dto.optionD ?? null,
      timeLimit: dto.timeLimit,
      points: dto.points,
    };

    const question = await this.createQuestionUseCase.execute(payload);

    return mapQuestionToResponse(question);
  }

  @Patch(':questionId')
  async update(
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body() dto: UpdateQuestionRequestDto,
    @Req() request: AuthenticatedRequest,
  ) {
    this.ensureAdmin(request);

    const payload: UpdateQuestionDto = {};

    if (dto.quizId !== undefined) payload.quizId = dto.quizId;
    if (dto.questionText !== undefined) payload.questionText = dto.questionText;
    if (dto.type !== undefined) payload.type = dto.type;
    if (dto.correctAnswer !== undefined) payload.correctAnswer = dto.correctAnswer;
    if (dto.optionA !== undefined) payload.optionA = dto.optionA ?? null;
    if (dto.optionB !== undefined) payload.optionB = dto.optionB ?? null;
    if (dto.optionC !== undefined) payload.optionC = dto.optionC ?? null;
    if (dto.optionD !== undefined) payload.optionD = dto.optionD ?? null;
    if (dto.timeLimit !== undefined) payload.timeLimit = dto.timeLimit;
    if (dto.points !== undefined) payload.points = dto.points;

    const question = await this.updateQuestionUseCase.execute(questionId, payload);

    return mapQuestionToResponse(question);
  }

  @Delete(':questionId')
  @HttpCode(204)
  async delete(
    @Param('questionId', ParseIntPipe) questionId: number,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    this.ensureAdmin(request);
    await this.deleteQuestionUseCase.execute(questionId);
  }
}

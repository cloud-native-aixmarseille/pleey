import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { CreateQuestionDto } from '../../application/quiz/dto/create-question.dto';
import type { UpdateQuestionDto } from '../../application/quiz/dto/update-question.dto';
import { CreateQuestionUseCase } from '../../application/quiz/use-cases/create-question.use-case';
import { DeleteQuestionUseCase } from '../../application/quiz/use-cases/delete-question.use-case';
import { UpdateQuestionUseCase } from '../../application/quiz/use-cases/update-question.use-case';
import { AppRole } from '../../domain/auth/enums/app-role.enum';
import type { QuestionId } from '../../domain/quiz/entities/question';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { mapQuestionToResponse } from '../shared/mappers/question-response.mapper';
import { CreateQuestionRequestDto } from './dto/create-question.request.dto';
import { UpdateQuestionRequestDto } from './dto/update-question.request.dto';

@Controller('questions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AppRole.ADMIN)
export class QuestionsController {
  constructor(
    private readonly createQuestionUseCase: CreateQuestionUseCase,
    private readonly updateQuestionUseCase: UpdateQuestionUseCase,
    private readonly deleteQuestionUseCase: DeleteQuestionUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateQuestionRequestDto) {
    const payload: CreateQuestionDto = {
      quizId: dto.quizId,
      position: dto.position,
      questionText: dto.questionText,
      type: dto.type,
      answers: dto.answers,
      timeLimit: dto.timeLimit,
      points: dto.points,
    };

    const question = await this.createQuestionUseCase.execute(payload);

    return mapQuestionToResponse(question);
  }

  @Patch(':questionId')
  async update(
    @Param('questionId', ParseIntPipe) questionId: QuestionId,
    @Body() dto: UpdateQuestionRequestDto,
  ) {
    const payload: UpdateQuestionDto = {};

    if (dto.quizId !== undefined) payload.quizId = dto.quizId;
    if (dto.position !== undefined) payload.position = dto.position;
    if (dto.questionText !== undefined) payload.questionText = dto.questionText;
    if (dto.type !== undefined) payload.type = dto.type;
    if (dto.answers !== undefined) payload.answers = dto.answers;
    if (dto.timeLimit !== undefined) payload.timeLimit = dto.timeLimit;
    if (dto.points !== undefined) payload.points = dto.points;

    const question = await this.updateQuestionUseCase.execute(questionId, payload);

    return mapQuestionToResponse(question);
  }

  @Delete(':questionId')
  @HttpCode(204)
  async delete(@Param('questionId', ParseIntPipe) questionId: QuestionId): Promise<void> {
    await this.deleteQuestionUseCase.execute(questionId);
  }
}

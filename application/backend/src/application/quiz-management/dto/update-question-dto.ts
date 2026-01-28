import { PartialType } from '@nestjs/swagger';
import { CreateQuestionDto } from './create-question.dto';

/**
 * Update Question DTO
 * Allows partial updates on an existing question
 */
export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {}

import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateQuizDto } from './create-quiz.dto';

/**
 * Update Quiz DTO
 * Data Transfer Object for updating a quiz
 */
export class UpdateQuizDto extends PartialType(OmitType(CreateQuizDto, ['organizationId'])) {}

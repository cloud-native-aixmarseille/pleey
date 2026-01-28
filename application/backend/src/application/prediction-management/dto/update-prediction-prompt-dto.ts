import { PartialType } from '@nestjs/swagger';
import { CreatePredictionPromptDto } from './create-prediction-prompt.dto';

/**
 * Update Prediction Prompt DTO
 * Allows partial updates on an existing prompt
 */
export class UpdatePredictionPromptDto extends PartialType(CreatePredictionPromptDto) {}

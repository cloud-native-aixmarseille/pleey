import { Injectable } from '@nestjs/common';
import type { QuizQuestionId } from '../../../../../domain/game/types/quiz/entities/quiz-question';
import { NumericIdentifierParser } from '../../../../shared/services/identifier-parser';

@Injectable()
export class QuizQuestionIdentifier extends NumericIdentifierParser<QuizQuestionId> {
  constructor() {
    super('QuizQuestionId');
  }
}

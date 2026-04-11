import { Injectable } from '@nestjs/common';
import type { QuizSelectableOptionId } from '../../../../../domain/game/types/quiz/entities/quiz-question';
import { NumericIdentifierParser } from '../../../../shared/services/identifier-parser';

@Injectable()
export class QuizSelectableOptionIdentifier extends NumericIdentifierParser<QuizSelectableOptionId> {
  constructor() {
    super('QuizSelectableOptionId');
  }
}

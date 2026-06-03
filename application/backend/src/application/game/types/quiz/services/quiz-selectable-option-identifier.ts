import { Injectable } from '@nestjs/common';
import type { QuizSelectableOptionId } from '../../../../../domain/game/types/quiz/entities/quiz-question';
import { UuidV7IdentifierParser } from '../../../../shared/services/identifier-parser';

@Injectable()
export class QuizSelectableOptionIdentifier extends UuidV7IdentifierParser<QuizSelectableOptionId> {
  constructor() {
    super('QuizSelectableOptionId');
  }
}

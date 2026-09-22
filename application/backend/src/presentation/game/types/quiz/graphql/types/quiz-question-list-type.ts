import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../../../../shared/graphql/types/paginated';
import { QuizQuestionTypeObject } from './quiz-types';

const PaginatedQuizQuestionType = Paginated(QuizQuestionTypeObject);

@ObjectType()
export class QuizQuestionListType extends PaginatedQuizQuestionType {}

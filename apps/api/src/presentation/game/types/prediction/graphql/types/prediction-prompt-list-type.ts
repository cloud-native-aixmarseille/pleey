import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../../../../shared/graphql/types/paginated';
import { PredictionPromptType } from './prediction-types';

const PaginatedPredictionPromptType = Paginated(PredictionPromptType);

@ObjectType()
export class PredictionPromptListType extends PaginatedPredictionPromptType {}

import { InputType } from '@nestjs/graphql';
import { PaginationInput } from '../../../shared/graphql/types/pagination-input';

@InputType()
export class UserGameHistoryInput extends PaginationInput {}

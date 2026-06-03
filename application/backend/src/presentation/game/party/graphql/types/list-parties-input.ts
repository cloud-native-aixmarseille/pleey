import { InputType } from '@nestjs/graphql';
import { PaginationInput } from '../../../../shared/graphql/types/pagination-input';

@InputType()
export class ListPartiesInput extends PaginationInput {}

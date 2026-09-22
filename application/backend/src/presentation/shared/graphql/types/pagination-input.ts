import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, Max, Min } from 'class-validator';
import { PAGINATION_LIMITS } from '../../../../domain/shared/value-objects/pagination-limits';

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: PAGINATION_LIMITS.defaultPage })
  @IsInt()
  @Min(1)
  @Max(PAGINATION_LIMITS.maxPage)
  page: number = PAGINATION_LIMITS.defaultPage;

  @Field(() => Int, { defaultValue: PAGINATION_LIMITS.defaultPageSize })
  @IsInt()
  @Min(1)
  @Max(PAGINATION_LIMITS.maxPageSize)
  pageSize: number = PAGINATION_LIMITS.defaultPageSize;
}

import { Field, InputType, Int } from '@nestjs/graphql';
import { PAGINATION_LIMITS } from '@pleey/domain/shared/primitives';
import { IsInt, Max, Min } from 'class-validator';

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

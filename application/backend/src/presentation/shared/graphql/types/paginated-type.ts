import type { Type } from '@nestjs/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import type { PaginatedResult } from '../../../../domain/shared/value-objects/paginated-result';

export function createPaginatedType<TItem>(itemType: Type<TItem>) {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType implements PaginatedResult<TItem> {
    @Field(() => [itemType])
    items!: readonly TItem[];

    @Field(() => Int)
    totalCount!: number;

    @Field(() => Int)
    overallCount!: number;

    @Field(() => Int)
    page!: number;

    @Field(() => Int)
    pageSize!: number;

    @Field(() => Int)
    totalPages!: number;
  }

  return PaginatedType;
}

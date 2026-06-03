import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, Max, Min } from 'class-validator';

@InputType({ isAbstract: true })
export abstract class PaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  page = 1;

  @Field(() => Int, { defaultValue: 9 })
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 9;
}

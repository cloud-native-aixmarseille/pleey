import { Field, InputType, Int } from '@nestjs/graphql';
import { ArrayUnique, IsArray, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationInput } from '../../../../shared/graphql/types/pagination-input';

@InputType()
export class ProjectGamesInput extends PaginationInput {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  projectId!: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  types?: string[];

  @Field(() => String, { defaultValue: 'createdAt' })
  @IsIn(['title', 'createdAt'])
  sortField: 'title' | 'createdAt' = 'createdAt';

  @Field(() => String, { defaultValue: 'desc' })
  @IsIn(['asc', 'desc'])
  sortDirection: 'asc' | 'desc' = 'desc';
}

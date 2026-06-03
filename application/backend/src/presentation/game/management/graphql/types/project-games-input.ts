import { Field, ID, InputType } from '@nestjs/graphql';
import { ArrayUnique, IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationInput } from '../../../../shared/graphql/types/pagination-input';

@InputType()
export class ProjectGamesInput extends PaginationInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  projectId!: string;

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

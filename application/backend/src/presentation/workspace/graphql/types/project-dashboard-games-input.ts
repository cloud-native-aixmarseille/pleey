import { Field, InputType, Int } from '@nestjs/graphql';
import { ArrayUnique, IsArray, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

@InputType()
export class ProjectDashboardGamesInput {
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
  @IsIn(['quiz', 'prediction'], { each: true })
  types?: string[];

  @Field(() => String, { defaultValue: 'createdAt' })
  @IsIn(['title', 'createdAt'])
  sortField: 'title' | 'createdAt' = 'createdAt';

  @Field(() => String, { defaultValue: 'desc' })
  @IsIn(['asc', 'desc'])
  sortDirection: 'asc' | 'desc' = 'desc';

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

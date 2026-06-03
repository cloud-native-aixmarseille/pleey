import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationInput } from '../../../shared/graphql/types/pagination-input';

@InputType()
export class OrganizationMembersInput extends PaginationInput {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  organizationId!: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}

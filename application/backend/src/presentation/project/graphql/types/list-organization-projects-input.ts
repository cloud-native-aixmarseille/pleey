import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationInput } from '../../../shared/graphql/types/pagination-input';

@InputType()
export class ListOrganizationProjectsInput extends PaginationInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  organizationId!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}

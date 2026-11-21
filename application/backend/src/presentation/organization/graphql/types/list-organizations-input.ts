import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { PaginationInput } from '../../../shared/graphql/types/pagination-input';

@InputType()
export class ListOrganizationsInput extends PaginationInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}

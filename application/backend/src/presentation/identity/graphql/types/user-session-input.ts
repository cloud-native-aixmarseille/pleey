import { Field, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { PaginationInput } from '../../../shared/graphql/types/pagination-input';

@InputType()
export class UserSessionListInput extends PaginationInput {}

@InputType()
export class RevokeUserSessionInput {
  @Field()
  @IsUUID('4')
  sessionId!: string;
}

import { Field, ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../../shared/graphql/types/paginated';

@ObjectType()
export class UserSessionType {
  @Field() id!: string;
  @Field(() => Date, { nullable: true }) createdAt!: Date | null;
  @Field(() => Date, { nullable: true }) lastActiveAt!: Date | null;
  @Field() expiresAt!: Date;
  @Field(() => String, { nullable: true }) userAgent!: string | null;
  @Field(() => String, { nullable: true }) ipAddress!: string | null;
}

const PaginatedUserSessionType = Paginated(UserSessionType);

@ObjectType()
export class UserSessionListType extends PaginatedUserSessionType {}

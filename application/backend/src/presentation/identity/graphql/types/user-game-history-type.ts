import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../../shared/graphql/types/paginated';

@ObjectType()
class UserGameHistoryEntryType {
  @Field() partyId!: string;
  @Field() title!: string;
  @Field() gameType!: string;
  @Field() status!: string;
  @Field() createdAt!: Date;
  @Field() role!: string;
  @Field(() => Int, { nullable: true }) points!: number | null;
}

const PaginatedUserGameHistoryType = Paginated(UserGameHistoryEntryType);

@ObjectType()
export class UserGameHistoryType extends PaginatedUserGameHistoryType {}

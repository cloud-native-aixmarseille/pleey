import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
class DashboardGameListItemType {
  @Field(() => Int)
  id!: number;

  @Field(() => Int)
  gameId!: number;

  @Field()
  type!: string;

  @Field()
  title!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field()
  createdAt!: Date;

  @Field(() => Int, { nullable: true })
  relatedGameId!: number | null;

  @Field(() => Int)
  stageCount!: number;
}

@ObjectType()
export class ProjectDashboardGamesType {
  @Field(() => [DashboardGameListItemType])
  items!: readonly DashboardGameListItemType[];

  @Field(() => Int)
  totalCount!: number;

  @Field(() => Int)
  overallCount!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  pageSize!: number;

  @Field(() => Int)
  totalPages!: number;
}

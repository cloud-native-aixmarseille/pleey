import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
class OrganizationDashboardEntityType {
  @Field(() => Int)
  id!: number;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;
}

@ObjectType()
class OrganizationDashboardStatsType {
  @Field(() => Int)
  totalGames!: number;

  @Field(() => Int)
  totalParties!: number;

  @Field(() => Int)
  activeParties!: number;

  @Field(() => Int)
  totalMembers!: number;

  @Field(() => Int)
  totalProjects!: number;
}

@ObjectType()
export class OrganizationDashboardType {
  @Field(() => OrganizationDashboardEntityType)
  organization!: OrganizationDashboardEntityType;

  @Field(() => OrganizationDashboardStatsType)
  stats!: OrganizationDashboardStatsType;
}

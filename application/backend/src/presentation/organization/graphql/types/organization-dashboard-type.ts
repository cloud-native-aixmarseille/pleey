import { Field, Int, ObjectType } from '@nestjs/graphql';
import { OrganizationType } from './organization-type';

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
  @Field(() => OrganizationType)
  organization!: OrganizationType;

  @Field(() => OrganizationDashboardStatsType)
  stats!: OrganizationDashboardStatsType;
}

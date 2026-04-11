import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';

registerEnumType(OrganizationRole, {
  name: 'OrganizationRole',
});

@ObjectType()
export class OrganizationType {
  @Field(() => Int)
  id!: number;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => OrganizationRole, { nullable: true })
  role?: OrganizationRole | null;
}

@ObjectType()
export class OrganizationListType {
  @Field(() => [OrganizationType])
  organizations!: OrganizationType[];
}

@ObjectType()
export class OrganizationMemberType {
  @Field(() => Int)
  id!: number;

  @Field(() => Int)
  organizationId!: number;

  @Field(() => Int)
  userId!: number;

  @Field(() => OrganizationRole)
  role!: OrganizationRole;

  @Field()
  joinedAt!: Date;
}

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

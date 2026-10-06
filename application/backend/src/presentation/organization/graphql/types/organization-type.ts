import { Field, ID, ObjectType } from '@nestjs/graphql';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import { PartySettingsType } from '../../../shared/graphql/types/party-settings-type';
import { OrganizationPermissionsType } from './organization-permissions-type';
import './organization-role-enum-type';

@ObjectType()
export class OrganizationType {
  @Field(() => OrganizationPermissionsType)
  permissions!: OrganizationPermissionsType;

  @Field(() => [OrganizationRole])
  assignableRoles!: readonly OrganizationRole[];

  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => PartySettingsType, { nullable: true })
  defaultPartySettings!: PartySettingsType | null;

  @Field(() => String, { nullable: true })
  defaultThemeId!: string | null;

  @Field(() => OrganizationRole, { nullable: true })
  role?: OrganizationRole | null;
}

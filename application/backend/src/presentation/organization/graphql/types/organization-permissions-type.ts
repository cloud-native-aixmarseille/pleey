import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import type { ActionPermission } from '../../../../domain/shared/value-objects/action-permission';
import { createActionPermissionType } from '../../../shared/graphql/types/action-permission-type';

registerEnumType(OrganizationErrorCode, { name: 'OrganizationActionDisabledReason' });
const OrganizationActionPermissionType = createActionPermissionType<OrganizationErrorCode>(
  'OrganizationActionPermission',
  OrganizationErrorCode,
);

@ObjectType()
export class OrganizationPermissionsType {
  @Field(() => OrganizationActionPermissionType)
  read!: ActionPermission<OrganizationErrorCode>;
  @Field(() => OrganizationActionPermissionType)
  update!: ActionPermission<OrganizationErrorCode>;
  @Field(() => OrganizationActionPermissionType)
  createProject!: ActionPermission<OrganizationErrorCode>;
  @Field(() => OrganizationActionPermissionType)
  manageMembers!: ActionPermission<OrganizationErrorCode>;
}

@ObjectType()
export class OrganizationMemberPermissionsType {
  @Field(() => OrganizationActionPermissionType)
  updateRole!: ActionPermission<OrganizationErrorCode>;
  @Field(() => OrganizationActionPermissionType)
  remove!: ActionPermission<OrganizationErrorCode>;
}

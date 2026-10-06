import { Field, ObjectType } from '@nestjs/graphql';
import { OrganizationErrorCode } from '../../../domain/organization/enums/organization-error-code.enum';
import type { ThemePermissions } from '../../../domain/theme/value-objects/theme-permissions';
import { createActionPermissionType } from '../../shared/graphql/types/action-permission-type';

const ThemeActionPermissionType = createActionPermissionType<OrganizationErrorCode>(
  'ThemeActionPermission',
  OrganizationErrorCode,
);

@ObjectType()
export class ThemePermissionsType {
  @Field(() => ThemeActionPermissionType) read!: ThemePermissions['read'];
  @Field(() => ThemeActionPermissionType) create!: ThemePermissions['create'];
  @Field(() => ThemeActionPermissionType) update!: ThemePermissions['update'];
  @Field(() => ThemeActionPermissionType) uploadAsset!: ThemePermissions['uploadAsset'];
}

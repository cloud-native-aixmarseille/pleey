import { Field, ObjectType } from '@nestjs/graphql';
import type { ThemePermissions } from '@pleey/contracts/theme';
import { OrganizationErrorCode } from '../../../domain/organization/enums/organization-error-code.enum';
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

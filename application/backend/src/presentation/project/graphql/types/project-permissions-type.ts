import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import type { ActionPermission } from '@pleey/domain/shared/primitives';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { ProjectErrorCode } from '../../../../domain/project/enums/project-error-code.enum';
import { createActionPermissionType } from '../../../shared/graphql/types/action-permission-type';

const ProjectPermissionReason = { ...OrganizationErrorCode, ...ProjectErrorCode };
registerEnumType(ProjectPermissionReason, { name: 'ProjectPermissionReason' });
const ProjectActionPermissionType = createActionPermissionType<OrganizationErrorCode | ProjectErrorCode>(
  'ProjectActionPermission',
  ProjectPermissionReason,
);

@ObjectType()
export class ProjectPermissionsType {
  @Field(() => ProjectActionPermissionType)
  update!: ActionPermission<OrganizationErrorCode>;
  @Field(() => ProjectActionPermissionType)
  delete!: ActionPermission<OrganizationErrorCode | ProjectErrorCode>;
}

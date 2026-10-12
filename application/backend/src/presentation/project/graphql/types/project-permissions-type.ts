import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { ProjectErrorCode } from '../../../../domain/project/enums/project-error-code.enum';
import type { ActionPermission } from '../../../../domain/shared/value-objects/action-permission';
import { createActionPermissionType } from '../../../shared/graphql/types/action-permission-type';

const ProjectActionDisabledReason = { ...OrganizationErrorCode, ...ProjectErrorCode };
registerEnumType(ProjectActionDisabledReason, { name: 'ProjectActionDisabledReason' });
const ProjectActionPermissionType = createActionPermissionType<OrganizationErrorCode | ProjectErrorCode>(
  'ProjectActionPermission',
  ProjectActionDisabledReason,
);

@ObjectType()
export class ProjectPermissionsType {
  @Field(() => ProjectActionPermissionType)
  update!: ActionPermission<OrganizationErrorCode>;
  @Field(() => ProjectActionPermissionType)
  delete!: ActionPermission<OrganizationErrorCode | ProjectErrorCode>;
}

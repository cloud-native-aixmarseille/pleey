import { registerEnumType } from '@nestjs/graphql';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';

registerEnumType(OrganizationRole, {
  name: 'OrganizationRole',
});

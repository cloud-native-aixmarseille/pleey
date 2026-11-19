import { registerEnumType } from '@nestjs/graphql';
import { OrganizationRole } from '@pleey/domain/organization';

registerEnumType(OrganizationRole, {
  name: 'OrganizationRole',
});

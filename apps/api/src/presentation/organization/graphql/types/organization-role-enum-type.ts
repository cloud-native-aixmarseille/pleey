import { registerEnumType } from '@nestjs/graphql';
import { OrganizationRole } from '@pleey/contracts/organization';

registerEnumType(OrganizationRole, {
  name: 'OrganizationRole',
});

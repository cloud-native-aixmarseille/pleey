import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../../shared/graphql/types/paginated';
import { OrganizationType } from './organization-type';

const PaginatedOrganizationListType = Paginated(OrganizationType);

@ObjectType()
export class OrganizationListType extends PaginatedOrganizationListType {}

import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../../shared/graphql/types/paginated';
import { OrganizationMemberType } from './organization-member-type';

const PaginatedOrganizationMemberListType = Paginated(OrganizationMemberType);

@ObjectType()
export class OrganizationMemberListType extends PaginatedOrganizationMemberListType {}

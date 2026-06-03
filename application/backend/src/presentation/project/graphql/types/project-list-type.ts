import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../../shared/graphql/types/paginated';
import { ProjectType } from './project-type';

const PaginatedProjectListType = Paginated(ProjectType);

@ObjectType()
export class ProjectListType extends PaginatedProjectListType {}

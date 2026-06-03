import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../../../shared/graphql/types/paginated';
import { ProjectGameListItemType } from './project-game-list-item-type';

const PaginatedProjectGamesType = Paginated(ProjectGameListItemType);

@ObjectType()
export class ProjectGamesType extends PaginatedProjectGamesType {}

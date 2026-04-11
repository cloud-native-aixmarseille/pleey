import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import type {
  GamePermissions,
  LaunchReadinessDisabledReason,
} from '../../../../../application/game/management/ports/game-catalog.port';
import {
  CreatePartyDisabledReason,
  LaunchReadinessDisabledReason as LaunchReadinessDisabledReasonEnum,
} from '../../../../../application/game/management/ports/game-catalog.port';
import type { ActionPermission } from '../../../../../domain/shared/value-objects/action-permission';
import { createActionPermissionType } from '../../../../shared/graphql/types/action-permission-type';
import { createPaginatedType } from '../../../../shared/graphql/types/paginated-type';

registerEnumType(CreatePartyDisabledReason, {
  name: 'CreatePartyDisabledReason',
});

registerEnumType(LaunchReadinessDisabledReasonEnum, {
  name: 'LaunchReadinessDisabledReason',
});

const ActionPermissionType = createActionPermissionType<CreatePartyDisabledReason>(
  'ActionPermissionType',
  CreatePartyDisabledReason,
);

const LaunchReadinessPermissionType = createActionPermissionType<LaunchReadinessDisabledReason>(
  'LaunchReadinessPermissionType',
  LaunchReadinessDisabledReasonEnum,
);

@ObjectType()
class GamePermissionsType implements GamePermissions {
  @Field(() => ActionPermissionType)
  createParty!: ActionPermission<CreatePartyDisabledReason>;

  @Field(() => LaunchReadinessPermissionType)
  launchReadiness!: ActionPermission<LaunchReadinessDisabledReason>;
}

@ObjectType()
class ProjectGameListItemType {
  @Field(() => Int)
  gameId!: number;

  @Field()
  type!: string;

  @Field()
  title!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field()
  createdAt!: Date;

  @Field(() => Int, { nullable: true })
  gameTypeId!: number | null;

  @Field(() => Int)
  stageCount!: number;

  @Field(() => GamePermissionsType)
  permissions!: GamePermissionsType;
}

const PaginatedProjectGamesType = createPaginatedType(ProjectGameListItemType);

@ObjectType()
export class ProjectGamesType extends PaginatedProjectGamesType {}

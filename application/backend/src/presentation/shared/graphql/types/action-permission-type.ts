import { Field, ObjectType } from '@nestjs/graphql';
import type { ActionPermission } from '../../../../domain/shared/value-objects/action-permission';

export function createActionPermissionType<Reason extends string>(
  name: string,
  reasonType: object,
) {
  @ObjectType(name)
  class ActionPermissionType implements ActionPermission<Reason> {
    @Field()
    allowed!: boolean;

    @Field(() => reasonType, { nullable: true })
    reason!: Reason | null;
  }

  return ActionPermissionType;
}

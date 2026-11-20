import { Field, ObjectType } from '@nestjs/graphql';

export function createActionPermissionType<Reason extends string>(name: string, reasonType: object) {
  @ObjectType(name)
  class ActionPermissionType {
    @Field()
    allowed!: boolean;

    @Field(() => reasonType, { nullable: true })
    reason!: Reason | null;
  }

  return ActionPermissionType;
}

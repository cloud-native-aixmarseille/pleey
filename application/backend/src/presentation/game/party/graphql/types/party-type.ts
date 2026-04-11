import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { PartyRole } from '../../../../../domain/game/party/enums/party-role.enum';
import { PartyStatus } from '../../../../../domain/game/party/enums/party-status.enum';

registerEnumType(PartyStatus, {
  name: 'PartyStatus',
});

registerEnumType(PartyRole, {
  name: 'PartyRole',
});

@ObjectType()
export class PartyType {
  @Field(() => Int)
  partyId!: number;

  @Field(() => Int)
  gameId!: number;

  @Field()
  pin!: string;

  @Field(() => PartyStatus)
  status!: PartyStatus;

  @Field(() => PartyRole)
  role!: PartyRole;

  @Field()
  createdAt!: Date;
}

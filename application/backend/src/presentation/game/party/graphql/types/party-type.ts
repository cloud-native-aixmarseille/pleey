import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
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
  @Field(() => ID)
  partyId!: string;

  @Field(() => ID)
  gameId!: string;

  @Field()
  pin!: string;

  @Field(() => PartyStatus)
  status!: PartyStatus;

  @Field(() => PartyRole)
  role!: PartyRole;

  @Field()
  createdAt!: Date;
}

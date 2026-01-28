import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GameSessionStatus } from '../../../../../domain/game/enums/game-session-status.enum';

export enum GameSessionParticipantRole {
  HOST = 'HOST',
  PLAYER = 'PLAYER',
}

registerEnumType(GameSessionParticipantRole, {
  name: 'GameSessionParticipantRole',
});

registerEnumType(GameSessionStatus, {
  name: 'GameSessionStatus',
});

@ObjectType()
export class GameSessionType {
  @Field(() => Int)
  sessionId!: number;

  @Field(() => Int)
  gameId!: number;

  @Field()
  pin!: string;

  @Field()
  @Field(() => GameSessionStatus)
  status!: GameSessionStatus;

  @Field(() => Int, { nullable: true })
  currentStageId!: number | null;

  @Field(() => GameSessionParticipantRole)
  participantRole!: GameSessionParticipantRole;

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class GameSessionListType {
  @Field(() => [GameSessionType])
  sessions!: GameSessionType[];
}

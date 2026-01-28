import { Field, Int, ObjectType } from '@nestjs/graphql';
import { AuthUserProfileType } from './auth-user-profile-type';

@ObjectType()
export class AuthResponseType {
  @Field()
  accessToken!: string;

  @Field()
  refreshToken!: string;

  @Field(() => Int)
  expiresIn!: number;

  @Field(() => AuthUserProfileType)
  user!: AuthUserProfileType;
}

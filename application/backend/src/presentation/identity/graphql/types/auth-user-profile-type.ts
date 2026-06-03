import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthUserProfileType {
  @Field(() => ID)
  id!: string;

  @Field()
  username!: string;

  @Field()
  email!: string;

  @Field(() => String, { nullable: true })
  avatarUri!: string | null;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;
}

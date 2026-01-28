import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthUserProfileType {
  @Field(() => Int)
  id!: number;

  @Field()
  username!: string;

  @Field()
  email!: string;

  @Field(() => String, { nullable: true })
  avatarUri!: string | null;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;
}

import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProjectType {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => ID)
  organizationId!: string;

  @Field()
  createdAt!: Date;
}

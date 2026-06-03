import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProjectType {
  @Field(() => Int)
  id!: number;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => Int)
  organizationId!: number;

  @Field()
  createdAt!: Date;
}

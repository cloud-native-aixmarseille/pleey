import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreatePredictionGameInput {
  @Field()
  title!: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Int)
  projectId!: number;
}

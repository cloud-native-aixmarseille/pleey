import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

@InputType()
export class PartySettingsInput {
  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(0)
  @Max(30)
  @IsOptional()
  questionReadingTimeSeconds?: number;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  allowJoiningAfterStart?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  allowOptionChangeAfterVoting?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  randomizeOptionOrder?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  randomizeStageOrder?: boolean;
}

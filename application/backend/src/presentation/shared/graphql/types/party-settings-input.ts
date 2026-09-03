import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional } from 'class-validator';

@InputType()
export class PartySettingsInput {
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

import { Field, ID, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { PartySettingsInput } from '../../../../shared/graphql/types/party-settings-input';

@InputType()
export class CreatePartyInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  gameId!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(6)
  privatePartyPassword?: string;

  @Field(() => PartySettingsInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => PartySettingsInput)
  settingsOverride?: PartySettingsInput;
}

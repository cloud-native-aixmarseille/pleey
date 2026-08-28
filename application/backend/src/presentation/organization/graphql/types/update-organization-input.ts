import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { PartySettingsInput } from '../../../shared/graphql/types/party-settings-input';

@InputType()
export class UpdateOrganizationInput {
  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @Field(() => PartySettingsInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => PartySettingsInput)
  defaultPartySettings?: PartySettingsInput;
}

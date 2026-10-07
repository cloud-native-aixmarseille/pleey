import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsOptional, IsString, Matches, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { THEME_ID_PATTERN, type ThemeId } from '../../../../domain/theme/entities/theme-id';
import { PartySettingsInput } from '../../../shared/graphql/types/party-settings-input';

@InputType()
export class UpdateProjectInput {
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

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(THEME_ID_PATTERN)
  defaultThemeId?: ThemeId | null;
}

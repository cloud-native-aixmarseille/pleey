import { ArrayNotEmpty, ArrayUnique, IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PartyEntryMessageDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  avatarSeed?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  guestId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  partyPassword?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  pin?: string;

  @IsOptional()
  @IsString()
  username?: string;
}

export class PartyObservationMessageDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  partyId?: string;
}

export class PartyHostPlayerMessageDto extends PartyObservationMessageDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  guestId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userId?: string;
}

export class SubmitPartyActionMessageDto extends PartyObservationMessageDto {
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  actionIds?: string[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  actionId?: string;
}

import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

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
  pin?: string;

  @IsOptional()
  @IsString()
  username?: string;
}

export class PartyObservationMessageDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  partyId?: number;
}

export class PartyHostPlayerMessageDto extends PartyObservationMessageDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  guestId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  userId?: number;
}

export class SubmitPartyActionMessageDto extends PartyObservationMessageDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  actionId?: number;
}

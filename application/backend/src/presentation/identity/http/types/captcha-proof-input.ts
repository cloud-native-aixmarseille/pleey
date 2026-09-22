import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CaptchaProofInput {
  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  token!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(Number.MAX_SAFE_INTEGER, { each: true })
  solutions!: number[];
}

import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  captchaToken!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  username!: string;

  @Field()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @Field()
  @IsString()
  @MinLength(6)
  password!: string;
}

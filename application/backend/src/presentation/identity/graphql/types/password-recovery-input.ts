import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class ForgotPasswordInput {
  @Field()
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @Field()
  @IsIn(['en', 'fr'])
  locale!: string;
}

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsString()
  @MaxLength(128)
  token!: string;

  @Field()
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  password!: string;
}

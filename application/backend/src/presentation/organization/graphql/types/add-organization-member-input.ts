import { Field, InputType } from '@nestjs/graphql';
import { OrganizationRole } from '@pleey/domain/organization';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import './organization-role-enum-type';

@InputType()
export class AddOrganizationMemberInput {
  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(320)
  usernameOrEmail!: string;

  @Field(() => OrganizationRole)
  @IsEnum(OrganizationRole)
  role!: OrganizationRole;
}

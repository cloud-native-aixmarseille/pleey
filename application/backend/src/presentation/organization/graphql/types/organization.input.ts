import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';

@InputType()
export class CreateOrganizationInput {
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
}

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

@InputType()
export class UpdateOrganizationMemberRoleInput {
  @Field(() => OrganizationRole)
  @IsEnum(OrganizationRole)
  role!: OrganizationRole;
}

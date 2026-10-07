import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Allow, IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';
import type { ThemeDocument } from '../../../domain/theme/entities/theme-document';
import { THEME_ID_PATTERN } from '../../../domain/theme/entities/theme-id';
import { Paginated } from '../../shared/graphql/types/paginated';
import { PaginationInput } from '../../shared/graphql/types/pagination-input';
import { ThemeDocumentScalar } from './theme-document-scalar';
@ObjectType()
export class ThemeType {
  @Field(() => ID) id!: string;
  @Field(() => ID) organizationId!: string;
  @Field(() => Int) revision!: number;
  @Field(() => ThemeDocumentScalar) document!: ThemeDocument;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}
@ObjectType()
export class ThemeListType extends Paginated(ThemeType) {}
@InputType()
export class ListThemesInput extends PaginationInput {
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(100) search?: string;
}
@InputType()
export class SaveThemeInput {
  @Field(() => ThemeDocumentScalar) @Allow() document!: ThemeDocument;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @Matches(THEME_ID_PATTERN) themeId?: string;
  @Field(() => Int, { nullable: true }) @IsOptional() @IsInt() @Min(1) expectedRevision?: number;
}
@ObjectType()
export class ThemeAssetType {
  @Field(() => ID) id!: string;
  @Field() url!: string;
  @Field(() => Int) width!: number;
  @Field(() => Int) height!: number;
}

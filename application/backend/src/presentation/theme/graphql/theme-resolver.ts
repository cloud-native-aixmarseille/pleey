import { Inject, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLUpload } from 'graphql-upload-minimal';
import { OrganizationIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-identifier';
import { ThemeIdentifier } from '../../../application/workspace/themes/services/theme-identifier';
import { GetThemeAccessUseCase } from '../../../application/workspace/themes/use-cases/get-theme-access-use-case';
import { GetThemeUseCase } from '../../../application/workspace/themes/use-cases/get-theme-use-case';
import { ListThemesUseCase } from '../../../application/workspace/themes/use-cases/list-themes-use-case';
import { SaveThemeUseCase } from '../../../application/workspace/themes/use-cases/save-theme-use-case';
import { UploadThemeAssetUseCase } from '../../../application/workspace/themes/use-cases/upload-theme-asset-use-case';
import type { UserId } from '../../../domain/identity/entities/user';
import { IdentityErrorCode } from '../../../domain/identity/enums/identity-error-code.enum';
import { GqlJwtAuthGuard } from '../../identity/shared/guards/gql-jwt-auth-guard';
import type { GraphqlUploadFile } from '../../shared/graphql/graphql-upload-reader';
import { ThemeAssetUploadReader } from './theme-asset-upload-reader';
import { ThemePermissionsType } from './theme-permissions-type';
import { ListThemesInput, SaveThemeInput, ThemeAssetType, ThemeListType, ThemeType } from './theme-types';

type ThemeAuthContext = {
  readonly req?: { readonly user?: { readonly id: UserId } };
  readonly user?: { readonly id: UserId };
};
@Resolver()
@UseGuards(GqlJwtAuthGuard)
export class ThemeResolver {
  constructor(
    @Inject(ListThemesUseCase) private readonly listThemesUseCase: ListThemesUseCase,
    @Inject(SaveThemeUseCase) private readonly saveThemeUseCase: SaveThemeUseCase,
    @Inject(UploadThemeAssetUseCase) private readonly uploadThemeAssetUseCase: UploadThemeAssetUseCase,
    @Inject(ThemeAssetUploadReader) private readonly uploads: ThemeAssetUploadReader,
    @Inject(OrganizationIdentifier) private readonly organizationIdentifier: OrganizationIdentifier,
    @Inject(ThemeIdentifier) private readonly themeIdentifier: ThemeIdentifier,
    @Inject(GetThemeAccessUseCase) private readonly getThemeAccessUseCase: GetThemeAccessUseCase,
    @Inject(GetThemeUseCase) private readonly getThemeUseCase: GetThemeUseCase,
  ) {}
  @Query(() => ThemePermissionsType)
  themePermissions(
    @Args('organizationId', { type: () => ID }) organizationId: string,
    @Context() context: ThemeAuthContext,
  ) {
    return this.getThemeAccessUseCase.execute(this.organizationIdentifier.parse(organizationId), this.user(context));
  }
  @Query(() => ThemeType)
  theme(
    @Args('organizationId', { type: () => ID }) organizationId: string,
    @Args('themeId', { type: () => ID }) themeId: string,
    @Context() context: ThemeAuthContext,
  ) {
    return this.getThemeUseCase.execute(
      this.organizationIdentifier.parse(organizationId),
      this.user(context),
      this.themeIdentifier.parse(themeId),
    );
  }
  @Query(() => ThemeListType)
  listThemes(
    @Args('organizationId', { type: () => ID }) organizationId: string,
    @Args('input', { nullable: true }) input: ListThemesInput,
    @Context() context: ThemeAuthContext,
  ) {
    return this.listThemesUseCase.execute(
      this.organizationIdentifier.parse(organizationId),
      this.user(context),
      input ?? {},
    );
  }
  @Mutation(() => ThemeType)
  saveTheme(
    @Args('organizationId', { type: () => ID }) organizationId: string,
    @Args('input') input: SaveThemeInput,
    @Context() context: ThemeAuthContext,
  ) {
    return this.saveThemeUseCase.execute(
      this.organizationIdentifier.parse(organizationId),
      this.user(context),
      input.document,
      this.themeIdentifier.parse(input.themeId) ?? undefined,
      input.expectedRevision,
    );
  }
  @Mutation(() => ThemeAssetType)
  uploadThemeAsset(
    @Args('organizationId', { type: () => ID }) organizationId: string,
    // Upload scalars are validated by the reader; Object metadata prevents DTO transformation of a Promise.
    @Args('file', { type: () => GraphQLUpload }) file: Promise<GraphqlUploadFile> | GraphqlUploadFile,
    @Context() context: ThemeAuthContext,
  ) {
    return this.uploadThemeAssetUseCase.execute(
      this.organizationIdentifier.parse(organizationId),
      this.user(context),
      this.uploads.source(file),
    );
  }
  private user(context: ThemeAuthContext): UserId {
    const id = context.req?.user?.id ?? context.user?.id;
    if (!id) throw new UnauthorizedException(IdentityErrorCode.UNAUTHORIZED);
    return id;
  }
}

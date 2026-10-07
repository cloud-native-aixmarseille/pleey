import { Inject, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLUpload } from 'graphql-upload-minimal';
import { OrganizationIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-identifier';
import { ThemeIdentifier } from '../../../application/workspace/themes/services/theme-identifier';
import { ListThemesUseCase } from '../../../application/workspace/themes/use-cases/list-themes-use-case';
import { SaveThemeUseCase } from '../../../application/workspace/themes/use-cases/save-theme-use-case';
import { UploadThemeAssetUseCase } from '../../../application/workspace/themes/use-cases/upload-theme-asset-use-case';
import type { UserId } from '../../../domain/identity/entities/user';
import { IdentityErrorCode } from '../../../domain/identity/enums/identity-error-code.enum';
import { GqlJwtAuthGuard } from '../../identity/shared/guards/gql-jwt-auth-guard';
import { ThemeAssetUploadReader, type ThemeUploadFile } from './theme-asset-upload-reader';
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
  ) {}
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
    @Args('file', { type: () => GraphQLUpload }) file: Promise<ThemeUploadFile>,
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

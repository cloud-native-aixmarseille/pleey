import { vi } from 'vitest';
import { OrganizationIdentifier } from '../../application/workspace/shared/services/identifiers/organization-identifier';
import { ThemeIdentifier } from '../../application/workspace/themes/services/theme-identifier';
import type { GetThemeAccessUseCase } from '../../application/workspace/themes/use-cases/get-theme-access-use-case';
import type { GetThemeUseCase } from '../../application/workspace/themes/use-cases/get-theme-use-case';
import type { ListThemesUseCase } from '../../application/workspace/themes/use-cases/list-themes-use-case';
import type { SaveThemeUseCase } from '../../application/workspace/themes/use-cases/save-theme-use-case';
import type { UploadThemeAssetUseCase } from '../../application/workspace/themes/use-cases/upload-theme-asset-use-case';
import { GraphqlUploadReader } from '../../presentation/shared/graphql/graphql-upload-reader';
import { ThemeAssetUploadReader } from '../../presentation/theme/graphql/theme-asset-upload-reader';
import { ThemeResolver } from '../../presentation/theme/graphql/theme-resolver';

export class ThemeResolverFixtureFactory {
  create() {
    const list = { execute: vi.fn<ListThemesUseCase['execute']>() };
    const save = { execute: vi.fn<SaveThemeUseCase['execute']>() };
    const upload = { execute: vi.fn<UploadThemeAssetUseCase['execute']>() };
    const access = { execute: vi.fn<GetThemeAccessUseCase['execute']>() };
    const get = { execute: vi.fn<GetThemeUseCase['execute']>() };
    const resolver = new ThemeResolver(
      list as unknown as ListThemesUseCase,
      save as unknown as SaveThemeUseCase,
      upload as unknown as UploadThemeAssetUseCase,
      new ThemeAssetUploadReader(new GraphqlUploadReader()),
      new OrganizationIdentifier(),
      new ThemeIdentifier(),
      access as unknown as GetThemeAccessUseCase,
      get as unknown as GetThemeUseCase,
    );
    return { resolver, list, save, upload, access, get };
  }
}

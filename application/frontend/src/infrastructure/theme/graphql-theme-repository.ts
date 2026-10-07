import { inject, injectable } from 'inversify';
import { OrganizationIdentifier } from '../../application/workspace/shared/services/identifiers/organization-identifier';
import { ThemeIdentifier } from '../../application/workspace/themes/services/theme-identifier';
import type { OrganizationId } from '../../domains/organization/entities/organization';
import type { PaginationQuery } from '../../domains/shared/value-objects/pagination-query';
import type { ManagedTheme } from '../../domains/theme/entities/managed-theme';
import type { SaveThemeCommand, ThemeRepository } from '../../domains/theme/ports/theme-repository';
import { ThemeDocumentNormalizer } from '../../domains/theme/services/theme-document-normalizer';
import { GraphqlClient } from '../graphql/client/graphql-client';
import {
  ListThemesDocument,
  SaveThemeDocument,
  type SaveThemeMutation,
  UploadThemeAssetDocument,
} from '../graphql/generated/graphql';
@injectable()
export class GraphqlThemeRepository implements ThemeRepository {
  constructor(
    @inject(GraphqlClient) private readonly client: GraphqlClient,
    @inject(ThemeDocumentNormalizer) private readonly normalizer: ThemeDocumentNormalizer,
    @inject(ThemeIdentifier) private readonly themeIdentifier: ThemeIdentifier,
    @inject(OrganizationIdentifier) private readonly organizationIdentifier: OrganizationIdentifier,
  ) {}
  async list(organizationId: OrganizationId, query: PaginationQuery) {
    const { listThemes } = await this.client.request(ListThemesDocument, {
      organizationId,
      input: { page: query.page ?? 1, pageSize: query.pageSize ?? 10, search: query.search },
    });
    return { ...listThemes, items: listThemes.items.map((item) => this.map(item)) };
  }
  async save(command: SaveThemeCommand) {
    const { organizationId, ...input } = command;
    const { saveTheme } = await this.client.request(SaveThemeDocument, { organizationId, input });
    return this.map(saveTheme);
  }
  async upload(organizationId: OrganizationId, file: File) {
    const { uploadThemeAsset } = await this.client.request(UploadThemeAssetDocument, { organizationId, file });
    return uploadThemeAsset;
  }
  private map(value: SaveThemeMutation['saveTheme']): ManagedTheme {
    return {
      ...value,
      id: this.themeIdentifier.parse(value.id),
      organizationId: this.organizationIdentifier.parse(value.organizationId),
      document: this.normalizer.normalize(value.document),
    };
  }
}

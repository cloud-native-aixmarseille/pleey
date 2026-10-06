import { inject, injectable } from 'inversify';
import type { OrganizationId } from '../../../../domains/organization/entities/organization';
import type { PaginationQuery } from '../../../../domains/shared/value-objects/pagination-query';
import type { ThemeDocument } from '../../../../domains/theme/entities/theme-document';
import type { ThemeId } from '../../../../domains/theme/entities/theme-id';
import {
  type SaveThemeCommand,
  type ThemeRepository,
  ThemeRepositoryToken,
} from '../../../../domains/theme/ports/theme-repository';
import { ThemeDocumentNormalizer } from '../../../../domains/theme/services/theme-document-normalizer';
import { ThemePaletteGenerator } from '../../../../domains/theme/services/theme-palette-generator';
import {
  type ThemeDraft,
  type ThemeDraftPort,
  ThemeDraftPortToken,
  type ThemeDraftScope,
} from '../ports/theme-draft.port';
@injectable()
export class ThemeManagementFacade {
  constructor(
    @inject(ThemeRepositoryToken) private readonly repository: ThemeRepository,
    @inject(ThemeDocumentNormalizer) private readonly normalizer: ThemeDocumentNormalizer,
    @inject(ThemePaletteGenerator) private readonly paletteGenerator: ThemePaletteGenerator,
    @inject(ThemeDraftPortToken) private readonly drafts: ThemeDraftPort,
  ) {}
  normalize(value: unknown): ThemeDocument {
    return this.normalizer.normalize(value);
  }
  applyColor(document: ThemeDocument, group: 'accent' | 'highlight', color: string): ThemeDocument {
    return this.paletteGenerator.apply(document, group, color);
  }
  readDraft(scope: ThemeDraftScope) {
    return this.drafts.read(scope);
  }
  writeDraft(scope: ThemeDraftScope, draft: ThemeDraft) {
    return this.drafts.write(scope, draft);
  }
  removeDraft(scope: ThemeDraftScope) {
    this.drafts.remove(scope);
  }
  list(organizationId: OrganizationId, query: PaginationQuery) {
    return this.repository.list(organizationId, query);
  }
  permissions(organizationId: OrganizationId) {
    return this.repository.permissions(organizationId);
  }
  get(organizationId: OrganizationId, themeId: ThemeId) {
    return this.repository.get(organizationId, themeId);
  }
  save(command: SaveThemeCommand) {
    return this.repository.save({ ...command, document: this.normalize(command.document) });
  }
  upload(organizationId: OrganizationId, file: File) {
    return this.repository.upload(organizationId, file);
  }
}

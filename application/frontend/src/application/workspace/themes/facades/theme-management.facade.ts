import { inject, injectable } from 'inversify';
import type { OrganizationId } from '../../../../domains/organization/entities/organization';
import type { PaginationQuery } from '../../../../domains/shared/value-objects/pagination-query';
import type { ThemeDocument } from '../../../../domains/theme/entities/theme-document';
import {
  type SaveThemeCommand,
  type ThemeRepository,
  ThemeRepositoryToken,
} from '../../../../domains/theme/ports/theme-repository';
import { ThemeDocumentNormalizer } from '../../../../domains/theme/services/theme-document-normalizer';
@injectable()
export class ThemeManagementFacade {
  constructor(
    @inject(ThemeRepositoryToken) private readonly repository: ThemeRepository,
    @inject(ThemeDocumentNormalizer) private readonly normalizer: ThemeDocumentNormalizer,
  ) {}
  normalize(value: unknown): ThemeDocument {
    return this.normalizer.normalize(value);
  }
  list(organizationId: OrganizationId, query: PaginationQuery) {
    return this.repository.list(organizationId, query);
  }
  save(command: SaveThemeCommand) {
    return this.repository.save({ ...command, document: this.normalize(command.document) });
  }
  upload(organizationId: OrganizationId, file: File) {
    return this.repository.upload(organizationId, file);
  }
}

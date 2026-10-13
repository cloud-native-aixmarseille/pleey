import { Inject, Injectable } from '@nestjs/common';
import type { OrganizationId } from '../../../../domain/organization/entities/organization';
import { CURATED_THEME_DOCUMENTS } from '../../../../domain/theme/entities/curated-theme-documents';
import type { ThemeDocument } from '../../../../domain/theme/entities/theme-document';
import { CURATED_THEME_IDS, DEFAULT_THEME_ID, type ThemeId } from '../../../../domain/theme/entities/theme-id';
import { ThemeError, ThemeErrorCode } from '../../../../domain/theme/errors/theme-error';
import { ThemeRepository } from '../../../../domain/theme/ports/theme-repository';

interface ResolveThemeSelectionInput {
  readonly organizationDefaultThemeId?: ThemeId | null;
  readonly projectDefaultThemeId?: ThemeId | null;
  readonly themeIdOverride?: ThemeId | null;
}

@Injectable()
export class ThemeSelectionService {
  constructor(@Inject(ThemeRepository) private readonly repository: ThemeRepository) {}

  async resolve(organizationId: OrganizationId, selection: ResolveThemeSelectionInput): Promise<ThemeDocument> {
    const themeId =
      selection.themeIdOverride ??
      selection.projectDefaultThemeId ??
      selection.organizationDefaultThemeId ??
      DEFAULT_THEME_ID;
    const curatedThemeId = CURATED_THEME_IDS.find((id) => id === themeId);
    if (curatedThemeId !== undefined) return CURATED_THEME_DOCUMENTS[curatedThemeId];
    const theme = await this.repository.findById(organizationId, themeId);
    if (!theme) throw new ThemeError(ThemeErrorCode.INVALID_SELECTION, { organizationId, themeId });
    return theme.document;
  }
}

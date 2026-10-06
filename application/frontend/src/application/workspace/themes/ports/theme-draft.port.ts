import type { ThemeDocument } from '../../../../domains/theme/entities/theme-document';

export interface ThemeDraftScope {
  readonly userId: string;
  readonly organizationId: string;
  readonly themeId: string;
}

export interface ThemeDraft {
  readonly document: ThemeDocument;
  readonly sourceRevision: number | null;
  readonly updatedAt: number;
}

export interface ThemeDraftPort {
  read(scope: ThemeDraftScope): ThemeDraft | null;
  write(scope: ThemeDraftScope, draft: ThemeDraft): boolean;
  remove(scope: ThemeDraftScope): void;
}

export const ThemeDraftPortToken = Symbol('ThemeDraftPort');

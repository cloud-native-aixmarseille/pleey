import { inject, injectable } from 'inversify';
import type {
  ThemeDraft,
  ThemeDraftPort,
  ThemeDraftScope,
} from '../../application/workspace/themes/ports/theme-draft.port';
import { type StoragePort, StoragePortToken } from '../../domains/shared/ports/storage.port';
import { StorageKey } from '../../domains/shared/value-objects/storage-key';
import { CURATED_THEME_IDS } from '../../domains/theme/entities/theme-id';

const MAX_DRAFT_AGE = 7 * 24 * 60 * 60 * 1000;
const MAX_DRAFTS = 20;

@injectable()
export class PersistedThemeDraftAdapter implements ThemeDraftPort {
  constructor(@inject(StoragePortToken) private readonly storage: StoragePort) {}

  read(scope: ThemeDraftScope): ThemeDraft | null {
    return this.entries()[this.key(scope)] ?? null;
  }

  write(scope: ThemeDraftScope, draft: ThemeDraft): boolean {
    try {
      const entries = { ...this.entries(), [this.key(scope)]: draft };
      const recent = Object.entries(entries)
        .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
        .slice(0, MAX_DRAFTS);
      this.storage.setItem(StorageKey.THEME_DRAFTS, JSON.stringify(Object.fromEntries(recent)));
      return true;
    } catch {
      return false;
    }
  }

  remove(scope: ThemeDraftScope): void {
    try {
      const entries = this.entries();
      delete entries[this.key(scope)];
      if (Object.keys(entries).length) this.storage.setItem(StorageKey.THEME_DRAFTS, JSON.stringify(entries));
      else this.storage.removeItem(StorageKey.THEME_DRAFTS);
    } catch {
      // Draft recovery is optional when browser storage is unavailable.
    }
  }

  private entries(): Record<string, ThemeDraft> {
    try {
      const raw = this.storage.getItem(StorageKey.THEME_DRAFTS);
      if (!raw || raw.length > 1_000_000) return {};
      const entries: unknown = JSON.parse(raw);
      if (!entries || typeof entries !== 'object' || Array.isArray(entries)) return {};
      return Object.fromEntries(Object.entries(entries).filter(([, draft]) => this.isDraft(draft)));
    } catch {
      return {};
    }
  }

  private key(scope: ThemeDraftScope): string {
    return JSON.stringify([scope.userId, scope.organizationId, scope.themeId, 1]);
  }

  private isDraft(value: unknown): value is ThemeDraft {
    if (!value || typeof value !== 'object') return false;
    const draft = value as Partial<ThemeDraft>;
    const document = draft.document;
    if (
      !document ||
      document.schemaVersion !== 1 ||
      !CURATED_THEME_IDS.includes(document.baseThemeId) ||
      typeof document.name !== 'string' ||
      document.name.length > 80 ||
      typeof draft.updatedAt !== 'number' ||
      draft.updatedAt > Date.now() ||
      Date.now() - draft.updatedAt > MAX_DRAFT_AGE ||
      (draft.sourceRevision !== null && (!Number.isInteger(draft.sourceRevision) || (draft.sourceRevision ?? 0) < 1))
    )
      return false;
    if (!document.overrides || typeof document.overrides !== 'object' || Array.isArray(document.overrides))
      return false;
    for (const [group, fields] of Object.entries(document.overrides)) {
      if (!fields || typeof fields !== 'object' || Array.isArray(fields)) return false;
      if (group === 'semantic') {
        if (
          Object.entries(fields).some(
            ([scheme, palette]) =>
              !['light', 'dark'].includes(scheme) ||
              !palette ||
              typeof palette !== 'object' ||
              Object.entries(palette).some(
                ([key, tokens]) => !['surface', 'text', 'border'].includes(key) || !this.stringFields(tokens),
              ),
          )
        )
          return false;
      } else if (group === 'colorScales') {
        if (
          Object.entries(fields).some(
            ([key, scale]) =>
              !['accent', 'highlight', 'success'].includes(key) ||
              !Array.isArray(scale) ||
              scale.length !== 10 ||
              scale.some((color) => typeof color !== 'string' || color.length > 160),
          )
        )
          return false;
      } else if (!['radius', 'spacing', 'motion', 'typography', 'assets'].includes(group) || !this.stringFields(fields))
        return false;
    }
    return true;
  }

  private stringFields(value: unknown): boolean {
    return (
      !!value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.values(value).every((field) => field === null || (typeof field === 'string' && field.length <= 160))
    );
  }
}

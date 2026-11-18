export interface ThemeDocumentNormalizerCoreOptions {
  readonly curatedThemeIds: readonly string[];
  readonly curatedThemePalettes: Record<string, unknown>;
  readonly keys: {
    readonly border: readonly string[];
    readonly fontFamilies: readonly string[];
    readonly motion: readonly string[];
    readonly radius: readonly string[];
    readonly spacing: readonly string[];
    readonly surface: readonly string[];
    readonly text: readonly string[];
    readonly typography: readonly string[];
  };
  readonly invalid: (field: string) => never;
}

export class ThemeDocumentNormalizerCore {
  constructor(options: ThemeDocumentNormalizerCoreOptions);
  normalize(value: unknown): {
    readonly schemaVersion: 1;
    readonly baseThemeId: string;
    readonly name: string;
    readonly overrides: Record<string, unknown>;
  };
}

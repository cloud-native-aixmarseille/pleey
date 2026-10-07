import type { ThemeDocument } from '../../../../domains/theme/entities/theme-document';
import type { UiThemeSeed } from './ui-theme-contract';
import { createUiThemeDefinition, findUiTheme } from './ui-theme-definition';
export function createUiThemeFromDocument(document: ThemeDocument) {
  const base = findUiTheme(document.baseThemeId).seed;
  const overrides = document.overrides;
  const semantic = (scheme: 'light' | 'dark') => {
    const original = base.semantic[scheme];
    const changes = overrides.semantic?.[scheme];
    const surface = { ...original.surface, ...changes?.surface };
    return {
      ...original,
      surface,
      text: { ...original.text, ...changes?.text },
      border: { ...original.border, ...changes?.border },
      shadow: {
        ...original.shadow,
        ...(changes?.border?.accent ? { focusRing: `0 0 0 3px ${changes.border.accent}` } : {}),
      },
    };
  };
  const seed: UiThemeSeed = {
    ...base,
    id: document.baseThemeId,
    name: document.name,
    assets: overrides.assets,
    colorScales: { ...base.colorScales, ...overrides.colorScales },
    radius: { ...base.radius, ...overrides.radius },
    spacing: { ...base.spacing, ...overrides.spacing },
    motion: { ...base.motion, ...overrides.motion },
    typography: { ...base.typography, ...overrides.typography },
    semantic: { light: semantic('light'), dark: semantic('dark') },
  };
  return createUiThemeDefinition(seed);
}

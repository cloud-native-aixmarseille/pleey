import { describe, expect, it } from 'vitest';
import { CYBER_ARCADE_THEME_NAME, cyberArcadeThemeSeed } from './cyber-arcade-theme';
import { SOLAR_GRID_THEME_ID, solarGridThemeSeed } from './solar-grid-theme';
import { statusToneRecipes, surfaceRecipes } from './ui-recipes';
import {
  createUiThemeCssVariables,
  createUiThemeTokens,
  DEFAULT_UI_COLOR_SCHEME,
  DEFAULT_UI_THEME_ID,
  findUiTheme,
  uiThemes,
} from './ui-theme';
import { uiTypeScale } from './ui-typography';

describe('theme', () => {
  const defaultUiThemeDefinition = findUiTheme(DEFAULT_UI_THEME_ID);

  describe('CYBER_ARCADE_THEME_NAME', () => {
    it('names the current shared UI theme', () => {
      expect(CYBER_ARCADE_THEME_NAME).toBe('Cyber Arcade');
      expect(cyberArcadeThemeSeed.name).toBe(CYBER_ARCADE_THEME_NAME);
    });
  });

  describe('createUiThemeTokens()', () => {
    it('maps a theme seed into semantic text, surface, and brand tokens for the default dark scheme', () => {
      const tokens = createUiThemeTokens(cyberArcadeThemeSeed, DEFAULT_UI_COLOR_SCHEME);

      expect(tokens.color.text.primary).toBe(cyberArcadeThemeSeed.semantic.dark.text.primary);
      expect(tokens.color.surface.panel).toBe(cyberArcadeThemeSeed.semantic.dark.surface.panel);
      expect(tokens.color.brand.primary).toBe(cyberArcadeThemeSeed.colorScales.accent[5]);
      expect(tokens.leaderboard.podiumGlow.first).toBe(
        cyberArcadeThemeSeed.semantic.dark.leaderboard.podiumGlow.first,
      );
      expect(tokens.leaderboard.podium.first.columnBackground).toBe(
        cyberArcadeThemeSeed.semantic.dark.leaderboard.podium.first.columnBackground,
      );
    });

    it('resolves a dedicated light palette when requested', () => {
      const tokens = createUiThemeTokens(cyberArcadeThemeSeed, 'light');

      expect(tokens.color.surface.canvas).toBe(cyberArcadeThemeSeed.semantic.light.surface.canvas);
      expect(tokens.color.text.primary).toBe(cyberArcadeThemeSeed.semantic.light.text.primary);
      expect(tokens.color.surface.canvas).not.toBe(
        cyberArcadeThemeSeed.semantic.dark.surface.canvas,
      );
    });
  });

  describe('defaultUiThemeDefinition.mantineTheme', () => {
    it('exposes the shared spacing, typography, and shadow defaults for the default scheme', () => {
      expect(defaultUiThemeDefinition.mantineTheme.spacing?.xl).toBe(
        defaultUiThemeDefinition.tokens.spacing.xl,
      );
      expect(defaultUiThemeDefinition.mantineTheme.fontFamily).toBe(
        defaultUiThemeDefinition.tokens.typography.bodyFamily,
      );
      expect(defaultUiThemeDefinition.tokens.typography.bodyFamily).toBe(
        '"Space Grotesk", system-ui, sans-serif',
      );
      expect(defaultUiThemeDefinition.tokens.typography.displayFamily).toBe(
        '"Orbitron", system-ui, sans-serif',
      );
      expect(defaultUiThemeDefinition.mantineTheme.shadows?.xl).toBe(
        defaultUiThemeDefinition.tokens.shadow.elevated,
      );
    });
  });

  describe('uiThemes', () => {
    it('registers multiple switchable themes with light and dark variants', () => {
      expect(uiThemes.map((theme) => theme.id)).toEqual([DEFAULT_UI_THEME_ID, SOLAR_GRID_THEME_ID]);
      expect(findUiTheme(SOLAR_GRID_THEME_ID).name).toBe('Solar Grid');
      expect(defaultUiThemeDefinition.tokensByColorScheme.light.color.surface.canvas).toBe(
        '#fff8fc',
      );
      expect(defaultUiThemeDefinition.tokensByColorScheme.dark.color.surface.canvas).toBe(
        '#12091f',
      );
    });
  });

  describe('createUiThemeCssVariables()', () => {
    it('maps resolved tokens into runtime css variables', () => {
      const cssVariables = createUiThemeCssVariables(defaultUiThemeDefinition.tokens) as Record<
        string,
        string
      >;

      expect(cssVariables['--ui-color-brand-primary']).toBe(
        defaultUiThemeDefinition.tokens.color.brand.primary,
      );
      expect(cssVariables['--ui-radius-panel']).toBe(defaultUiThemeDefinition.tokens.radius.panel);
    });
  });

  describe('expanded semantic tokens', () => {
    it('maps new border tokens (info, warning, live) for dark scheme', () => {
      const tokens = createUiThemeTokens(cyberArcadeThemeSeed, 'dark');
      expect(tokens.color.border.info).toBe(cyberArcadeThemeSeed.semantic.dark.border.info);
      expect(tokens.color.border.warning).toBe(cyberArcadeThemeSeed.semantic.dark.border.warning);
      expect(tokens.color.border.live).toBe(cyberArcadeThemeSeed.semantic.dark.border.live);
    });

    it('maps new shadow tokens (subtle, focusRing, liveGlow)', () => {
      const tokens = createUiThemeTokens(cyberArcadeThemeSeed, 'dark');
      expect(tokens.shadow.subtle).toBeDefined();
      expect(tokens.shadow.focusRing).toBeDefined();
      expect(tokens.shadow.liveGlow).toBeDefined();
    });

    it('maps new surface tokens (live, overlay, warning)', () => {
      const tokens = createUiThemeTokens(cyberArcadeThemeSeed, 'dark');
      expect(tokens.color.surface.live).toBe(cyberArcadeThemeSeed.semantic.dark.surface.live);
      expect(tokens.color.surface.overlay).toBe(cyberArcadeThemeSeed.semantic.dark.surface.overlay);
      expect(tokens.color.surface.warning).toBe(cyberArcadeThemeSeed.semantic.dark.surface.warning);
    });

    it('maps new text tokens (link, live, onAction, warning)', () => {
      const tokens = createUiThemeTokens(cyberArcadeThemeSeed, 'dark');
      expect(tokens.color.text.link).toBe(cyberArcadeThemeSeed.semantic.dark.text.link);
      expect(tokens.color.text.live).toBe(cyberArcadeThemeSeed.semantic.dark.text.live);
      expect(tokens.color.text.onAction).toBe(cyberArcadeThemeSeed.semantic.dark.text.onAction);
      expect(tokens.color.text.warning).toBe(cyberArcadeThemeSeed.semantic.dark.text.warning);
    });

    it('exposes new tokens in CSS variable map', () => {
      const cssVars = createUiThemeCssVariables(defaultUiThemeDefinition.tokens) as Record<
        string,
        string
      >;
      expect(cssVars['--ui-color-border-info']).toBeDefined();
      expect(cssVars['--ui-leaderboard-podium-glow-first']).toBeDefined();
      expect(cssVars['--ui-leaderboard-podium-first-column-background']).toBeDefined();
      expect(cssVars['--ui-shadow-focus-ring']).toBeDefined();
      expect(cssVars['--ui-color-surface-live']).toBeDefined();
      expect(cssVars['--ui-color-text-link']).toBeDefined();
    });
  });

  describe('expanded spacing & motion', () => {
    it('adds xxs, xxl, xxxl spacing values', () => {
      const tokens = createUiThemeTokens(cyberArcadeThemeSeed, 'dark');
      expect(tokens.spacing.xxs).toBe(cyberArcadeThemeSeed.spacing.xxs);
      expect(tokens.spacing.xxl).toBe(cyberArcadeThemeSeed.spacing.xxl);
      expect(tokens.spacing.xxxl).toBe(cyberArcadeThemeSeed.spacing.xxxl);
    });

    it('adds reveal, emphasis, modal motion timings', () => {
      const tokens = createUiThemeTokens(cyberArcadeThemeSeed, 'dark');
      expect(tokens.motion.reveal).toBe(cyberArcadeThemeSeed.motion.reveal);
      expect(tokens.motion.emphasis).toBe(cyberArcadeThemeSeed.motion.emphasis);
      expect(tokens.motion.modal).toBe(cyberArcadeThemeSeed.motion.modal);
    });
  });

  describe('solar-grid seed parity', () => {
    it('satisfies the same expanded interface as cyber-arcade', () => {
      const tokens = createUiThemeTokens(solarGridThemeSeed, 'dark');
      expect(tokens.color.border.info).toBeDefined();
      expect(tokens.leaderboard.podiumGlow.second).toBeDefined();
      expect(tokens.leaderboard.podium.third.badgeBackground).toBeDefined();
      expect(tokens.color.surface.live).toBeDefined();
      expect(tokens.color.text.warning).toBeDefined();
      expect(tokens.shadow.focusRing).toBeDefined();
      expect(tokens.spacing.xxs).toBeDefined();
      expect(tokens.motion.reveal).toBeDefined();
    });
  });

  describe('uiTypeScale', () => {
    it('defines all expected type-scale entries', () => {
      const expectedKeys = [
        'hero',
        'pageTitle',
        'sectionTitle',
        'cardTitle',
        'body',
        'bodySmall',
        'label',
        'overline',
        'caption',
        'mono',
        'monoSmall',
        'metric',
      ];
      expect(Object.keys(uiTypeScale)).toEqual(expect.arrayContaining(expectedKeys));
    });

    it('each entry contains fontFamily, fontSize, fontWeight, lineHeight, letterSpacing', () => {
      for (const entry of Object.values(uiTypeScale)) {
        expect(entry).toHaveProperty('fontFamily');
        expect(entry).toHaveProperty('fontSize');
        expect(entry).toHaveProperty('fontWeight');
        expect(entry).toHaveProperty('lineHeight');
        expect(entry).toHaveProperty('letterSpacing');
      }
    });
  });

  describe('surfaceRecipes', () => {
    it('provides all expected surface tiers', () => {
      expect(surfaceRecipes.canvas.background).toBeDefined();
      expect(surfaceRecipes.elevated.boxShadow).toBeDefined();
      expect(surfaceRecipes.inset.background).toBeDefined();
      expect(surfaceRecipes.hero.background).toContain('linear-gradient');
      expect(surfaceRecipes.overlay.backdropFilter).toContain('blur');
      expect(surfaceRecipes.live.boxShadow).toBeDefined();
      expect(surfaceRecipes.interactive.boxShadow).toBeDefined();
    });
  });

  describe('statusToneRecipes', () => {
    it('provides warning and live tones alongside info/success/error', () => {
      expect(statusToneRecipes.warning.color).toBeDefined();
      expect(statusToneRecipes.live.background).toBeDefined();
      expect(statusToneRecipes.info.borderColor).toBeDefined();
    });
  });
});

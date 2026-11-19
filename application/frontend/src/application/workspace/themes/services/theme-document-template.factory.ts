import { CURATED_THEME_PALETTES, DEFAULT_THEME_ID } from '@pleey/domain/theme';
import { inject, injectable } from 'inversify';
import {
  THEME_MOTION_KEYS,
  THEME_RADIUS_KEYS,
  THEME_SPACING_KEYS,
  THEME_TYPOGRAPHY_KEYS,
} from '../../../../domains/theme/entities/theme-document';
import { ThemePaletteGenerator } from '../../../../domains/theme/services/theme-palette-generator';
import { type TranslationPort, TranslationPortToken } from '../../../shared/ports/translation.port';
import type { ThemeTemplateFile } from '../ports/theme-document-transfer.port';

const TEMPLATE_FILE_NAME = 'pleey-theme-template.json';
const TEMPLATE_MIME_TYPE = 'application/json';
const SAFE_LIGHT_TEXT = {
  danger: '#a11a43',
  emphasis: '#180d2b',
  link: '#00665f',
  live: '#971553',
  onAction: '#ffffff',
  primary: '#24133d',
  quiet: '#40364e',
  secondary: '#40364e',
  soft: '#40364e',
  status: '#24133d',
  statusSoft: '#40364e',
  warning: '#8a5e00',
} as const;
const SAFE_LIGHT_BORDER = {
  accent: '#00665f',
  danger: '#a11a43',
  info: '#00665f',
  live: '#971553',
  strong: '#971553',
  subtle: '#24133d',
  success: '#324f0f',
  warning: '#8a5e00',
} as const;
const SAFE_DARK_TEXT = {
  danger: '#ffffff',
  emphasis: '#ffffff',
  link: '#1ee8d7',
  live: '#ffffff',
  onAction: '#000000',
  primary: '#f6f4ff',
  quiet: '#c8c3d1',
  secondary: '#c8c3d1',
  soft: '#c8c3d1',
  status: '#ffffff',
  statusSoft: '#ffffff',
  warning: '#ffffff',
} as const;
const SAFE_DARK_BORDER = {
  accent: '#1ee8d7',
  danger: '#fb7185',
  info: '#1ee8d7',
  live: '#ff4fa3',
  strong: '#ffffff',
  subtle: '#ffffff',
  success: '#b8ff5c',
  warning: '#ffbf00',
} as const;

type ThemeTemplateValue = string | null | readonly string[] | ThemeTemplateObject;
interface ThemeTemplateObject {
  readonly [key: string]: ThemeTemplateValue;
}

@injectable()
export class ThemeDocumentTemplateFactory {
  constructor(
    @inject(ThemePaletteGenerator) private readonly paletteGenerator: ThemePaletteGenerator,
    @inject(TranslationPortToken) private readonly translation: TranslationPort,
  ) {}

  create(): ThemeTemplateFile {
    const base = CURATED_THEME_PALETTES[DEFAULT_THEME_ID];
    const scales = {
      accent: this.paletteGenerator.generateScale(base.colorScales.accent[5]),
      highlight: this.paletteGenerator.generateScale(base.colorScales.highlight[5]),
      success: this.paletteGenerator.generateScale(base.colorScales.success[5]),
    };
    const semantic = Object.fromEntries(
      (['light', 'dark'] as const).map((scheme) => {
        const source = base.semantic[scheme];
        return [
          scheme,
          {
            $comment: this.translation.t(`theme.template.semantic.${scheme}`),
            surface: this.comment(source.surface, 'surface', this.toHexPalette(source.surface, source.surface.canvas)),
            text: this.comment(source.text, 'text', scheme === 'light' ? SAFE_LIGHT_TEXT : SAFE_DARK_TEXT),
            border: this.comment(source.border, 'border', scheme === 'light' ? SAFE_LIGHT_BORDER : SAFE_DARK_BORDER),
          },
        ];
      }),
    );
    const overrides: ThemeTemplateObject = {
      $comment: this.translation.t('theme.template.overrides'),
      colorScales: {
        $comment: this.translation.t('theme.template.colorScales'),
        ...scales,
      },
      semantic: {
        $comment: this.translation.t('theme.template.semantic.root'),
        ...semantic,
      },
      radius: this.values(THEME_RADIUS_KEYS, 'radius', {
        field: '18px',
        inset: '20px',
        panel: '28px',
        pill: '999px',
      }),
      spacing: this.values(THEME_SPACING_KEYS, 'spacing', {
        xxs: '4px',
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl: '40px',
        xxl: '56px',
        xxxl: '80px',
      }),
      motion: this.values(THEME_MOTION_KEYS, 'motion', {
        emphasis: '400ms',
        modal: '240ms',
        quick: '120ms',
        reveal: '300ms',
        standard: '180ms',
      }),
      typography: this.values(THEME_TYPOGRAPHY_KEYS, 'typography', {
        body: 'system-ui, sans-serif',
        display: 'system-ui, sans-serif',
        mono: 'ui-monospace, monospace',
        overline: 'system-ui, sans-serif',
      }),
      assets: {
        $comment: this.translation.t('theme.template.assets.root'),
        logoAssetUri: null,
        backgroundAssetUri: null,
      },
    };
    return {
      content: JSON.stringify(
        {
          $comment: this.translation.t('theme.template.root'),
          schemaVersion: 1,
          baseThemeId: DEFAULT_THEME_ID,
          name: this.translation.t('theme.template.name'),
          overrides,
        },
        null,
        2,
      ),
      fileName: TEMPLATE_FILE_NAME,
      mimeType: TEMPLATE_MIME_TYPE,
    };
  }

  private values(
    keys: readonly string[],
    commentKey: string,
    values: Record<string, string>,
  ): Record<string, ThemeTemplateValue> {
    return {
      $comment: this.translation.t(`theme.template.${commentKey}`),
      ...Object.fromEntries(keys.map((key) => [key, values[key]])),
    };
  }

  private comment(
    keys: Readonly<Record<string, string>>,
    commentKey: string,
    values: Record<string, string>,
  ): Record<string, ThemeTemplateValue> {
    return {
      $comment: this.translation.t(`theme.template.semantic.${commentKey}`),
      ...Object.fromEntries(Object.keys(keys).map((key) => [key, values[key]])),
    };
  }

  private toHexPalette(values: Readonly<Record<string, string>>, canvas: string): Record<string, string> {
    return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, this.toHex(value, canvas)]));
  }

  private toHex(value: string, canvas: string): string {
    if (/^#[0-9a-f]{6}$/i.test(value)) return value.toLowerCase();
    const match = value.match(/^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/i);
    if (!match) throw new TypeError(`Unsupported theme color: ${value}`);
    const alpha = Number(match[4] ?? 1);
    const background = [1, 3, 5].map((index) => parseInt(canvas.slice(index, index + 2), 16));
    return `#${[1, 2, 3]
      .map((index) => Math.round(Number(match[index]) * alpha + background[index - 1] * (1 - alpha)))
      .map((channel) => channel.toString(16).padStart(2, '0'))
      .join('')}`;
  }
}

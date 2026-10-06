import { themePaletteShadeStyle, themePaletteStyle } from './theme-palette-preview.styles';

export function ThemePalettePreview({ colors }: { readonly colors: readonly string[] }) {
  return (
    <div style={themePaletteStyle} aria-hidden>
      {colors.map((color, index) => (
        <span key={String(index)} style={themePaletteShadeStyle(color)} />
      ))}
    </div>
  );
}

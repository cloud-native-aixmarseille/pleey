import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';

export const listStyle = {
  display: 'grid',
  gap: '0.75rem',
  listStyle: 'none',
  margin: 0,
  padding: 0,
} as const;

export const dropIndicatorStyle = {
  background: uiThemeTokens.color.brand.primary,
  borderRadius: '999px',
  boxShadow: `0 0 0 4px color-mix(in srgb, ${uiThemeTokens.color.brand.primary} 18%, transparent)`,
  height: '0.25rem',
  margin: '0.2rem 0',
} as const;

export const createItemCardStyle = (
  selected: boolean,
  isDragging: boolean,
  isDropTarget: boolean,
) =>
  ({
    background: isDropTarget
      ? `color-mix(in srgb, ${uiThemeTokens.color.brand.primary} 10%, ${uiThemeTokens.color.surface.recessed})`
      : selected
        ? uiThemeTokens.color.surface.accentMuted
        : 'transparent',
    border: isDropTarget
      ? `1px solid ${uiThemeTokens.color.border.accent}`
      : selected
        ? `1px solid ${uiThemeTokens.color.brand.primary}`
        : `1px solid ${uiThemeTokens.color.border.subtle}`,
    borderRadius: '1rem',
    color: 'inherit',
    cursor: isDragging ? 'grabbing' : 'pointer',
    display: 'grid',
    gap: '0.5rem',
    opacity: isDragging ? 0.55 : 1,
    padding: '0.9rem',
    transform: isDropTarget ? 'scale(1.01)' : 'scale(1)',
    transition:
      'background 120ms ease, border-color 120ms ease, opacity 120ms ease, transform 120ms ease',
    width: '100%',
  }) as const;

export const itemSelectButtonStyle = {
  '--button-bd': '1px solid transparent',
  '--button-bg': 'transparent',
  '--button-color': 'inherit',
  '--button-hover': 'transparent',
  '--button-hover-color': 'inherit',
  alignItems: 'flex-start',
  background: 'transparent',
  borderRadius: '0.85rem',
  display: 'grid',
  gap: '0.5rem',
  height: 'auto',
  justifyContent: 'flex-start',
  minHeight: 'unset',
  padding: '0.3rem 0.4rem',
  width: '100%',
} as const;

export const itemMetaRowStyle = {
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  width: '100%',
} as const;

export const itemTitleStyle = {
  display: 'block',
  fontWeight: 700,
  overflow: 'visible',
  textAlign: 'left',
  whiteSpace: 'normal',
  width: '100%',
  wordBreak: 'break-word',
} as const;

export const itemMetaStatStyle = {
  alignItems: 'center',
  border: `1px solid ${uiThemeTokens.color.border.subtle}`,
  borderRadius: '999px',
  display: 'flex',
  gap: '0.35rem',
  padding: '0.2rem 0.55rem',
} as const;

export const itemActionRowStyle = {
  alignItems: 'center',
  display: 'flex',
  gap: '0.75rem',
  justifyContent: 'space-between',
} as const;

export const createDragHandleStyle = (isHovering: boolean, isDragging: boolean) =>
  ({
    alignItems: 'center',
    background: isHovering
      ? `color-mix(in srgb, ${uiThemeTokens.color.brand.primary} 10%, transparent)`
      : 'transparent',
    border: isHovering
      ? `1px solid color-mix(in srgb, ${uiThemeTokens.color.brand.primary} 55%, transparent)`
      : '1px solid transparent',
    borderRadius: '0.85rem',
    cursor: isDragging ? 'grabbing' : 'grab',
    display: 'flex',
    gap: '0.5rem',
    padding: '0.35rem 0.55rem',
    touchAction: 'none',
    transition: 'background 120ms ease, border-color 120ms ease',
  }) as const;

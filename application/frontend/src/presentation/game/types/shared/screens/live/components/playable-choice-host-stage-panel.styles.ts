import { surfaceRecipes } from '../../../../../../shared/ui/foundation/ui-recipes';

export const stageShellStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100dvh - 16rem)',
  minHeight: '24rem',
  width: '100%',
} as const;

export const stageHeroStyle = {
  ...surfaceRecipes.hero,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: 'var(--mantine-spacing-md)',
  minHeight: 0,
  padding: 'var(--mantine-spacing-lg)',
} as const;

export const stageMetaStyle = {
  margin: '0 auto',
  maxWidth: '60rem',
  width: '100%',
} as const;

export const stageMetaRowStyle = {
  alignItems: 'center',
  columnGap: 'var(--mantine-spacing-md)',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  rowGap: 'var(--mantine-spacing-sm)',
  width: '100%',
} as const;

export const stageMetaPrimarySlotStyle = {
  display: 'flex',
  flex: '1 1 14rem',
  justifyContent: 'flex-start',
  minWidth: '0',
} as const;

export const stageMetaTimerSlotStyle = {
  display: 'flex',
  flex: '0 0 auto',
  justifyContent: 'center',
} as const;

export const stageMetaStatusStyle = {
  display: 'flex',
  flex: '1 1 16rem',
  justifyContent: 'flex-end',
  minWidth: '14rem',
} as const;

export const stagePromptRegionStyle = {
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: 'var(--mantine-spacing-sm)',
  justifyContent: 'center',
  minHeight: 0,
  textAlign: 'center',
  width: '100%',
} as const;

export const stageMediaSlotStyle = {
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  minHeight: 0,
  width: '100%',
} as const;

export const stageShellStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: 'calc(100vh - 240px)',
  width: '100%',
} as const;

export const stageContentStyle = {
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: 'var(--mantine-spacing-xl)',
} as const;

export const stageMetaStyle = {
  margin: '0 auto',
  maxWidth: '52rem',
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
  justifyContent: 'center',
  textAlign: 'center',
  width: '100%',
} as const;

export const stagePromptContentStyle = {
  margin: '0 auto',
  maxWidth: '60rem',
  width: '100%',
} as const;

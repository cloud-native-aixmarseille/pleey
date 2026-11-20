interface CreateEditFormModeCopy {
  readonly titleKey: string;
  readonly eyebrowKey: string;
  readonly submitKey: string;
  readonly submittingKey: string;
}

export function resolveCreateEditFormModeCopy(mode: 'create' | 'edit', baseKey: string): CreateEditFormModeCopy {
  const modeKey = mode === 'create' ? 'create' : 'edit';

  return {
    titleKey: `${baseKey}.${modeKey}.title`,
    eyebrowKey: `${baseKey}.${modeKey}.eyebrow`,
    submitKey: `${baseKey}.${modeKey}.submit`,
    submittingKey: `${baseKey}.${modeKey}.submitting`,
  };
}

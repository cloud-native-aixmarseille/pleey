export const withDefaults = <T extends object>(
  defaults: T,
  overrides: Partial<T> = {},
): T => {
  const result: T = { ...defaults };

  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined) {
      (result as Record<string, unknown>)[key] = value;
    }
  }

  return result;
};

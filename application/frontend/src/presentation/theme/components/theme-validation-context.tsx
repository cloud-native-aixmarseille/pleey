import { createContext, useContext } from 'react';

export const ThemeValidationContext = createContext({ field: '', descriptionId: '' });

export function useThemeFieldValidation(path: string) {
  const { field, descriptionId } = useContext(ThemeValidationContext);
  const invalid = !!field && (field === path || field.startsWith(`${path}.`) || path.startsWith(`${field}.`));
  return {
    'data-theme-field': path,
    'aria-invalid': invalid || undefined,
    'aria-describedby': invalid ? descriptionId : undefined,
  };
}

import { useLayoutEffect } from 'react';
import type { ThemeDocument } from '../../../../../domains/theme/entities/theme-document';
import { usePresentationThemeState } from '../../../../shared/ui/provider';

export function usePartyTheme(document: ThemeDocument | undefined): void {
  const { applyScopedTheme } = usePresentationThemeState();

  useLayoutEffect(() => {
    if (document === undefined) {
      return;
    }

    return applyScopedTheme(document);
  }, [document, applyScopedTheme]);
}

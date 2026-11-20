import type { ThemeDocument } from '@pleey/contracts/theme';
import { useLayoutEffect } from 'react';
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

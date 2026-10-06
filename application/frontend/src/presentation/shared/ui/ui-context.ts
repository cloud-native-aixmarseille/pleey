import { createContext } from 'react';
import type { UiPort } from '../../../application/shared/ports/ui.port';

// Keep identity shared when provider components are loaded through a refreshed module URL.
export const UiContext = createContext<UiPort | null>(null);

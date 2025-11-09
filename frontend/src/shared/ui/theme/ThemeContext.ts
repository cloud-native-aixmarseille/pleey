import { createContext, useContext } from "react";
import type { ThemeTokens } from "./types";
import { NEON_THEME_TOKENS } from "./tokens";

export const ThemeContext = createContext<ThemeTokens>(NEON_THEME_TOKENS);

export function useTheme(): ThemeTokens {
  return useContext(ThemeContext);
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { COLOR_SCHEME_STORAGE_KEY } from "../../../../domains/shared/constants/storageKeys";

export type ColorSchemePreference = "system" | "light" | "dark";
export type ResolvedColorScheme = "light" | "dark";

interface ColorSchemeContextValue {
  preference: ColorSchemePreference;
  resolved: ResolvedColorScheme;
  setPreference: (preference: ColorSchemePreference) => void;
}

const ColorSchemeContext = createContext<ColorSchemeContextValue | null>(null);

function readStoredPreference(): ColorSchemePreference {
  if (typeof window === "undefined") {
    return "system";
  }

  try {
    const value = window.localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
    if (value === "light" || value === "dark" || value === "system") {
      return value;
    }
  } catch {
    // Ignore storage errors (private mode, denied access, etc.)
  }

  return "system";
}

function getSystemResolvedScheme(): ResolvedColorScheme {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyResolvedSchemeToDom(resolved: ResolvedColorScheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.dataset.colorScheme = resolved;

  // Helps UA-rendered elements (form controls, scrollbars, etc.).
  root.style.colorScheme = resolved;
}

export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ColorSchemePreference>(() =>
    readStoredPreference(),
  );
  const [systemResolved, setSystemResolved] = useState<ResolvedColorScheme>(
    () => getSystemResolvedScheme(),
  );

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      setSystemResolved(media.matches ? "dark" : "light");
    };

    handleChange();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }

    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, []);

  const resolved = preference === "system" ? systemResolved : preference;

  useEffect(() => {
    applyResolvedSchemeToDom(resolved);
  }, [resolved]);

  const setPreference = useCallback((next: ColorSchemePreference) => {
    setPreferenceState(next);

    try {
      window.localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, next);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const value = useMemo<ColorSchemeContextValue>(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference],
  );

  return (
    <ColorSchemeContext.Provider value={value}>
      {children}
    </ColorSchemeContext.Provider>
  );
}

export function useColorScheme(): ColorSchemeContextValue {
  const value = useContext(ColorSchemeContext);
  if (!value) {
    throw new Error("useColorScheme must be used within ColorSchemeProvider");
  }

  return value;
}

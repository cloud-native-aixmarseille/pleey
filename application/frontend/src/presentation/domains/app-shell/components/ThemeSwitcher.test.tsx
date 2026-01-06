import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ThemeSwitcher from "./ThemeSwitcher";
import { ColorSchemeProvider } from "../../../../presentation/shared/ui/theme";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "common.theme.ariaLabel": "Theme",
        "common.theme.system": "System",
        "common.theme.light": "Light",
        "common.theme.dark": "Dark",
      };
      return translations[key] || key;
    },
  }),
}));

function setMatchMedia(prefersDark: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => {
      return {
        matches: query.includes("prefers-color-scheme") ? prefersDark : false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    }),
  });
}

describe("ThemeSwitcher", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
    delete document.documentElement.dataset.colorScheme;
    setMatchMedia(false);
  });

  it("renders system/light/dark options", () => {
    render(
      <ColorSchemeProvider>
        <ThemeSwitcher variant="inline" />
      </ColorSchemeProvider>
    );

    expect(screen.getByRole("button", { name: "System" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Light" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dark" })).toBeInTheDocument();
  });

  it("defaults preference to system", () => {
    render(
      <ColorSchemeProvider>
        <ThemeSwitcher variant="inline" />
      </ColorSchemeProvider>
    );

    const systemButton = screen.getByRole("button", { name: "System" });
    expect(systemButton).toHaveAttribute("aria-pressed", "true");
  });

  it("persists preference and updates html class", () => {
    render(
      <ColorSchemeProvider>
        <ThemeSwitcher variant="inline" />
      </ColorSchemeProvider>
    );

    expect(document.documentElement.classList.contains("dark")).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Dark" }));

    expect(window.localStorage.getItem("quizmaster_color_scheme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.dataset.colorScheme).toBe("dark");
  });
});

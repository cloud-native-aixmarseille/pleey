import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

export function bootstrapColorScheme() {
  try {
    const stored = window.localStorage.getItem("quizmaster_color_scheme");
    const preference =
      stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "system";

    const systemResolved = window.matchMedia?.("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    const resolved = preference === "system" ? systemResolved : preference;

    const root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    root.dataset.colorScheme = resolved;
    root.style.colorScheme = resolved;
  } catch {
    // ignore
  }
}

export function renderApp(rootElement: HTMLElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}

bootstrapColorScheme();

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element '#root' not found");
}

renderApp(rootElement);

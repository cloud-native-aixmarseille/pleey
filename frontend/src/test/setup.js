import { afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import i18n from "../i18n/config";

// Initialize i18n for tests with English as default
beforeAll(async () => {
  await i18n.changeLanguage("en");
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

const originalWarn = console.warn.bind(console);
const originalError = console.error.bind(console);

const suppressedWarningPatterns = [
  "React Router Future Flag Warning",
  "was not wrapped in act",
];

const suppressedErrorPatterns = [
  "Warning: An update to",
  "Not implemented: HTMLCanvasElement.prototype.getContext",
];

console.warn = (...args) => {
  const [firstArg] = args;
  if (
    typeof firstArg === "string" &&
    suppressedWarningPatterns.some((pattern) => firstArg.includes(pattern))
  ) {
    return;
  }
  originalWarn(...args);
};

console.error = (...args) => {
  const [firstArg] = args;
  if (
    typeof firstArg === "string" &&
    suppressedErrorPatterns.some((pattern) => firstArg.includes(pattern))
  ) {
    return;
  }
  originalError(...args);
};

// Mock window.matchMedia - only in browser environment
/* global window */
if (typeof window !== "undefined") {
  // Ensure React treats this environment as act-compatible to avoid noisy warnings
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });

  HTMLCanvasElement.prototype.getContext = () => ({
    fillRect: () => {},
    clearRect: () => {},
    getImageData: () => ({ data: [] }),
    putImageData: () => {},
    createImageData: () => [],
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    fillText: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    arc: () => {},
    quadraticCurveTo: () => {},
    canvas: HTMLCanvasElement,
  });
}

import { defineConfig } from "@playwright/test";
import base from "./playwright.config";
export default defineConfig(base, {
  testDir: "./tests/usage",
  testIgnore: [],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  use: {
    ...base.use,
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
    locale: "en-US",
    timezoneId: "UTC",
    video: "off",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
});

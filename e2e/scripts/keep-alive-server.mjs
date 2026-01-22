#!/usr/bin/env node

/**
 * Simple helper used by Playwright's webServer setting.
 * It keeps the process alive so Playwright can poll the target URL
 * while reminding developers to start the actual stack (docker or local dev servers).
 */
const message =
  process.env.PLAYWRIGHT_WAIT_MESSAGE ??
  "Playwright is waiting for the stack to be available. Run 'make up' or start the dev servers locally.";

console.log(message);
console.log("Press Ctrl+C to stop this helper when tests finish.");

const shutdown = () => {
  console.log("Stopping Playwright helper process.");
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

setInterval(() => {
  // Keep process alive without busy looping
}, 60 * 1000);

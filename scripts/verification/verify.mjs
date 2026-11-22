import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", env: process.env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(
    "Usage: pnpm verify\nRuns locked install, formatting, lint, type checks, unit tests, builds and documentation checks.",
  );
  process.exit(0);
}

run("pnpm", ["install", "--frozen-lockfile"]);
run("pnpm", ["--filter", "@pleey/api", "db:generate"]);
run("pnpm", ["--dir", "application/backend", "lint:ci"]);
run("pnpm", ["--dir", "application/frontend", "lint:ci"]);
run("pnpm", ["--filter", "@pleey/contracts", "typecheck"]);
run("pnpm", ["--filter", "@pleey/contracts", "build"]);
run("pnpm", ["--filter", "@pleey/api", "typecheck"]);
run("pnpm", ["--filter", "@pleey/web", "typecheck"]);
run("pnpm", ["--filter", "@pleey/api", "test"]);
run("pnpm", ["--filter", "@pleey/web", "test"]);
run("pnpm", ["--filter", "@pleey/api", "build"]);
run("pnpm", ["--filter", "@pleey/web", "build"]);
run("pnpm", ["--filter", "@pleey/api", "docs:check"]);
run("pnpm", ["--filter", "@pleey/web", "docs:check"]);

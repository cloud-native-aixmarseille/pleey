import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";

const phase = process.argv.find((value) => value === "--phase")
  ? process.argv[process.argv.indexOf("--phase") + 1]
  : "01";
const project = `pleey-p${phase}-${randomUUID().slice(0, 8)}`;

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { stdio: "inherit", env });
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed`);
}

function runPnpm(args, env = process.env) {
  const pnpmExecPath = process.env.npm_execpath;
  if (pnpmExecPath) {
    return /\.[cm]?js$/u.test(pnpmExecPath)
      ? run(process.execPath, [pnpmExecPath, ...args], env)
      : run(pnpmExecPath, args, env);
  }
  return run("pnpm", args, env);
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(
    "Usage: pnpm test:integration --phase 01\nUses a run-owned PostgreSQL/Valkey Compose project and checked-in migrations.",
  );
  process.exit(0);
}

try {
  run("docker", ["compose", "-p", project, "-f", "compose.integration.yaml", "up", "-d", "--wait"]);
  const databaseUrl = "postgresql://pleey:pleey@127.0.0.1:54329/pleey_test?schema=public";
  const testEnvironment = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    DATABASE_URL_TEST: databaseUrl,
    VALKEY_URL: "redis://127.0.0.1:6380",
  };
  runPnpm(["--filter", "@pleey/api", "db:migrate"], testEnvironment);
  runPnpm(["--filter", "@pleey/api", "test"], testEnvironment);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  spawnSync("docker", ["compose", "-p", project, "-f", "compose.integration.yaml", "down", "-v", "--remove-orphans"], {
    stdio: "inherit",
  });
}

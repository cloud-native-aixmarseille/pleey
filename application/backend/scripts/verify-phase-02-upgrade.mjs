import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const backendRoot = path.resolve(import.meta.dirname, "..");
const repositoryRoot = path.resolve(backendRoot, "../..");
const workRoot = path.join(repositoryRoot, ".cache", "agent-work");
mkdirSync(workRoot, { recursive: true });
const workDirectory = mkdtempSync(path.join(workRoot, "phase02-upgrade-"));
const scratchPrisma = path.join(workDirectory, "prisma");
const schema = path.join(scratchPrisma, "schema.prisma");
const migrations = path.join(scratchPrisma, "migrations");
const config = path.join(workDirectory, "prisma.config.ts");
const finalMigration = "20261122090000_unify_identity";
const connectionString = process.env.DATABASE_URL.replace("schema=public", "schema=phase02_upgrade");
const executionEnvironment = { ...process.env, DATABASE_URL: connectionString };

function runPrisma(command) {
  const pnpmExecPath = process.env.npm_execpath ?? "pnpm";
  const executable = /\.[cm]?js$/u.test(pnpmExecPath) ? process.execPath : pnpmExecPath;
  const prefix = executable === process.execPath ? [pnpmExecPath] : [];
  const result = spawnSync(
    executable,
    [...prefix, "exec", "prisma", ...command.split(" "), "--config", config],
    { cwd: backendRoot, env: executionEnvironment, stdio: "inherit" },
  );
  if (result.status !== 0) throw new Error(`Prisma ${command} failed`);
}

try {
  mkdirSync(migrations, { recursive: true });
  cpSync(path.join(backendRoot, "prisma", "schema.prisma"), schema);
  for (const entry of readdirMigrations()) {
    if (entry !== finalMigration) {
      cpSync(path.join(backendRoot, "prisma", "migrations", entry), path.join(migrations, entry), {
        recursive: true,
      });
    }
  }
  writeFileSync(
    config,
    readFileSync(path.join(backendRoot, "prisma.config.ts"), "utf8")
      .replace("'./prisma/schema.prisma'", JSON.stringify(schema))
      .replace("pnpm seed", "pnpm seed"),
  );
  runPrisma("migrate deploy");

  const adapterOptions = { schema: "phase02_upgrade" };
  const prisma = new PrismaClient({ adapter: new PrismaPg(connectionString, adapterOptions) });
  try {
    const ids = {
      game: "01800000-0000-7000-8000-000000000003",
      guest: "01800000-0000-7000-8000-000000000006",
      host: "01800000-0000-7000-8000-000000000001",
      organization: "01800000-0000-7000-8000-000000000002",
      party: "01800000-0000-7000-8000-000000000004",
      project: "01800000-0000-7000-8000-000000000005",
      score: "01800000-0000-7000-8000-000000000007",
    };
    await prisma.$executeRawUnsafe(
      `INSERT INTO "phase02_upgrade"."users" ("id","username","updated_at") VALUES ($1,'phase02-host',CURRENT_TIMESTAMP)`,
      ids.host,
    );
    await prisma.$executeRawUnsafe(
      `INSERT INTO "phase02_upgrade"."user_authentications" ("user_id","email","password","created_at","updated_at")
       VALUES ($1,'phase02-host@invalid.local','unused',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`,
      ids.host,
    );
    await prisma.$executeRawUnsafe(
      `INSERT INTO "phase02_upgrade"."organizations" ("id","name","updated_at") VALUES ($1,'Upgrade org',CURRENT_TIMESTAMP)`,
      ids.organization,
    );
    await prisma.$executeRawUnsafe(
      `INSERT INTO "phase02_upgrade"."projects" ("id","name","organization_id","updated_at")
       VALUES ($1,'Upgrade project',$2,CURRENT_TIMESTAMP)`,
      ids.project,
      ids.organization,
    );
    await prisma.$executeRawUnsafe(
      `INSERT INTO "phase02_upgrade"."games" ("id","type","title","project_id","updated_at")
       VALUES ($1,'quiz','Upgrade game',$2,CURRENT_TIMESTAMP)`,
      ids.game,
      ids.project,
    );
    await prisma.$executeRawUnsafe(
      `INSERT INTO "phase02_upgrade"."parties" ("id","game_id","host_id","pin","settings","theme_document","updated_at")
       VALUES ($1,$2,$3,'UPGR02','{}'::jsonb,'{}'::jsonb,CURRENT_TIMESTAMP)`,
      ids.party,
      ids.game,
      ids.host,
    );
    await prisma.$executeRawUnsafe(
      `INSERT INTO "phase02_upgrade"."guests" ("id","username","avatar_seed","updated_at")
       VALUES ($1,'Historical guest','historical',CURRENT_TIMESTAMP)`,
      ids.guest,
    );
    await prisma.$executeRawUnsafe(
      `INSERT INTO "phase02_upgrade"."scores" ("id","party_id","guest_id","points","updated_at")
       VALUES ($1,$2,$3,850,CURRENT_TIMESTAMP)`,
      ids.score,
      ids.party,
      ids.guest,
    );
  } finally {
    await prisma.$disconnect();
  }

  cpSync(path.join(backendRoot, "prisma", "migrations", finalMigration), path.join(migrations, finalMigration), {
    recursive: true,
  });
  runPrisma("migrate deploy");

  const migrated = new PrismaClient({ adapter: new PrismaPg(connectionString, adapterOptions) });
  try {
    const rows = await migrated.$queryRawUnsafe(`
      SELECT
        (SELECT COUNT(*)::int FROM "phase02_upgrade"."users") AS users,
        (SELECT COUNT(*)::int FROM "phase02_upgrade"."party_participants" WHERE "user_id" IS NULL) AS detached,
        (SELECT COUNT(*)::int FROM "phase02_upgrade"."party_participants" WHERE "display_name" = 'Historical guest') AS named,
        (SELECT COUNT(*)::int FROM "phase02_upgrade"."scores" WHERE "points" = 850 AND "participant_id" IS NOT NULL) AS scores
    `);
    const result = rows[0];
    if (result.users !== 1 || result.detached !== 1 || result.named !== 1 || result.scores !== 1) {
      throw new Error(`Phase 02 historical guest migration failed: ${JSON.stringify(result)}`);
    }
  } finally {
    await migrated.$disconnect();
  }
  console.log("Phase 02 upgrade rehearsal passed.");
} finally {
  rmSync(workDirectory, { force: true, recursive: true });
}

function readdirMigrations() {
  return readdirSync(path.join(backendRoot, "prisma", "migrations"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

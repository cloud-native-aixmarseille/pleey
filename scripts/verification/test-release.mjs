import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const phase = process.argv.includes("--phase") ? process.argv[process.argv.indexOf("--phase") + 1] : "01";
const profile = process.argv.includes("--profile") ? process.argv[process.argv.indexOf("--profile") + 1] : "compose";
const output = process.argv.includes("--output")
  ? process.argv[process.argv.indexOf("--output") + 1]
  : `artifacts/phase-${phase}/release.json`;

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log("Usage: pnpm test:release --phase 01 --profile compose --output artifacts/phase-01/release.json");
  process.exit(0);
}

mkdirSync(output.slice(0, output.lastIndexOf("/")), { recursive: true });
execFileSync(
  "docker",
  ["build", "--target", "prod", "-f", "application/backend/Dockerfile", "-t", "pleey-api:test", "."],
  { stdio: "inherit" },
);
execFileSync(
  "docker",
  ["build", "--target", "prod", "-f", "application/frontend/Dockerfile", "-t", "pleey-web:test", "."],
  { stdio: "inherit" },
);

function inspectDigest(image) {
  try {
    const repositoryDigest = execFileSync(
      "docker",
      ["image", "inspect", "--format", "{{index .RepoDigests 0}}", image],
      { encoding: "utf8" },
    ).trim();
    return repositoryDigest && repositoryDigest !== "<no value>"
      ? repositoryDigest
      : execFileSync("docker", ["image", "inspect", "--format", "{{.Id}}", image], { encoding: "utf8" }).trim();
  } catch {
    return image;
  }
}
const apiDigest = inspectDigest("pleey-api:test");
const webDigest = inspectDigest("pleey-web:test");
const chart = readFileSync("charts/application/Chart.yaml");
const manifest = {
  phase,
  sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  releaseId: `${execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim().slice(0, 12)}-p${phase}`,
  profile,
  images: { api: apiDigest || "pleey-api:test", web: webDigest || "pleey-web:test" },
  chartSha256: createHash("sha256").update(chart).digest("hex"),
  protocolMajors: { identity: phase === "02" || Number(phase) > 2 ? 2 : 1, http: 1, game: 1 },
};
writeFileSync(output, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(output);

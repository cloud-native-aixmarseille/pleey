import fs from "node:fs";
import path from "node:path";

function resolveFrontendRoot() {
  const scriptWorkspaceRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  const candidates = [
    path.join(scriptWorkspaceRoot, "application/frontend"),
    process.cwd(),
    path.join(process.cwd(), "application/frontend"),
  ];

  const frontendRoot = candidates.find((candidate) =>
    fs.existsSync(path.join(candidate, "src/presentation")),
  );

  if (!frontendRoot) {
    throw new Error(
      `Unable to locate frontend presentation root from candidates: ${candidates.join(", ")}`,
    );
  }

  return frontendRoot;
}

const frontendRoot = resolveFrontendRoot();
const presentationRoot = path.join(frontendRoot, "src/presentation");
const EXEMPTION_TOKEN = "adr-0026-allow-separate-create-edit";

function walk(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(absolutePath, files);
      continue;
    }

    if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      files.push(absolutePath);
    }
  }

  return files;
}

function toPosix(filePath) {
  return filePath.replace(/\\/g, "/");
}

function toFrontendRelative(filePath) {
  return toPosix(path.relative(frontendRoot, filePath));
}

function hasExemption(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  return content.includes(EXEMPTION_TOKEN);
}

function hasSharedCompanion(directoryPath, resourceName) {
  const sharedFileCandidates = [
    `${resourceName}-form-dialog.tsx`,
    `${resourceName}-form.tsx`,
    `use-${resourceName}-form-dialog-state.ts`,
    `use-${resourceName}-form-state.ts`,
  ];

  return sharedFileCandidates.some((candidate) => fs.existsSync(path.join(directoryPath, candidate)));
}

function findCreateEditPairs() {
  const files = walk(presentationRoot);
  const pairs = [];

  for (const filePath of files) {
    const fileName = path.basename(filePath);
    const match = fileName.match(/^create-(.+)-form\.tsx$/);
    if (!match) {
      continue;
    }

    const resourceName = match[1];
    const directoryPath = path.dirname(filePath);
    const editFilePath = path.join(directoryPath, `edit-${resourceName}-form.tsx`);
    const updateFilePath = path.join(directoryPath, `update-${resourceName}-form.tsx`);
    const peerPath = fs.existsSync(editFilePath) ? editFilePath : fs.existsSync(updateFilePath) ? updateFilePath : null;

    if (!peerPath) {
      continue;
    }

    pairs.push({
      createFilePath: filePath,
      peerFilePath: peerPath,
      resourceName,
      directoryPath,
    });
  }

  return pairs;
}

export function runFrontendCreateEditFactorizationCheck() {
  const violations = [];
  const pairs = findCreateEditPairs();

  for (const pair of pairs) {
    const hasExemptedSplit = hasExemption(pair.createFilePath) || hasExemption(pair.peerFilePath);
    if (hasExemptedSplit) {
      continue;
    }

    if (hasSharedCompanion(pair.directoryPath, pair.resourceName)) {
      continue;
    }

    violations.push(pair);
  }

  if (violations.length === 0) {
    console.log("Frontend create/edit form factorization guard passed.");
    return;
  }

  console.error("Frontend create/edit form factorization guard failed:");
  for (const violation of violations) {
    console.error(`- ${toFrontendRelative(violation.createFilePath)} and ${toFrontendRelative(violation.peerFilePath)} define a parallel create/edit form pair without a shared companion form/state file.`);
    console.error(
      `  Add a shared ${violation.resourceName}-form-dialog.tsx and use-${violation.resourceName}-form-dialog-state.ts, or add an explicit exemption token '${EXEMPTION_TOKEN}' with rationale.`,
    );
  }

  process.exitCode = 1;
}

if (import.meta.url === new URL(process.argv[1], "file://").href) {
  runFrontendCreateEditFactorizationCheck();
}

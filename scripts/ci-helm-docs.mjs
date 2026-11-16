import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const COMMIT = /^[a-f0-9]{40}$/u;

async function readGit(args) {
  const { stdout } = await execFileAsync("git", args, {
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
    timeout: 15_000,
  });
  return stdout;
}

function affectsHelmDocs(path) {
  if (
    !path ||
    /[\\\u0000-\u001f]/u.test(path) ||
    path.split("/").some((part) => !part || part === "." || part === "..")
  ) {
    return true;
  }
  return path !== "README.md" && !["application/", "docs/", "e2e/"].some((prefix) => path.startsWith(prefix));
}

export async function needsHelmDocs({ github, context, attempt, git = readGit }) {
  const branch = context.payload?.repository?.default_branch;
  if (context.eventName !== "push" || !branch || context.ref !== `refs/heads/${branch}` || attempt !== 1) return true;
  if (!COMMIT.test(context.sha || "")) return true;
  try {
    const { data } = await github.rest.actions.listWorkflowRuns({
      ...context.repo,
      workflow_id: "main-ci.yml",
      branch,
      event: "push",
      status: "success",
      per_page: 1,
    });
    const baseline = data.workflow_runs?.[0];
    if (
      !baseline ||
      baseline.id === context.runId ||
      baseline.head_branch !== branch ||
      baseline.event !== "push" ||
      baseline.status !== "completed" ||
      baseline.conclusion !== "success" ||
      !COMMIT.test(baseline.head_sha || "")
    )
      return true;
    if ((await git(["rev-parse", "HEAD"])).trim() !== context.sha) return true;
    await git(["merge-base", "--is-ancestor", baseline.head_sha, context.sha]);
    const changed = await git(["diff", "--no-renames", "--name-only", "-z", baseline.head_sha, context.sha, "--"]);
    if (changed !== "" && !changed.endsWith("\0")) return true;
    return changed === "" ? false : changed.slice(0, -1).split("\0").some(affectsHelmDocs);
  } catch {
    return true;
  }
}

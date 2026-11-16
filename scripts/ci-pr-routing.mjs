const CI_JOBS = [
  "linter",
  "build-backend-ci-image",
  "check-backend",
  "build-frontend-ci-image",
  "check-frontend",
  "build-backend-candidate",
  "build-frontend-candidate",
  "tests-charts",
  "promote-images",
];

function isDocumentation(path) {
  if (typeof path !== "string" || path.includes("\\") || /[\u0000-\u001f]/u.test(path)) return false;
  if (path.split("/").some((part) => !part || part === "." || part === "..")) return false;
  return path === "README.md" || (path.startsWith("docs/") && path.endsWith(".md"));
}

export function classifyPullRequestFiles({ head, base, before, after, files }) {
  if (!head || !base || !Array.isArray(files) || files.length === 0) return "full";
  for (const snapshot of [before, after]) {
    if (snapshot?.head?.sha !== head || snapshot?.base?.sha !== base || snapshot?.changed_files !== files.length)
      return "full";
  }
  if (new Set(files.map((file) => file?.filename)).size !== files.length) return "full";
  for (const file of files) {
    if (!isDocumentation(file?.filename)) return "full";
    if (file.status === "renamed") {
      if (!isDocumentation(file.previous_filename)) return "full";
    } else if (!["added", "modified", "removed"].includes(file.status)) {
      return "full";
    }
  }
  return "documentation";
}

export async function resolvePullRequestScope({ github, context }) {
  if (context.eventName !== "pull_request") return "full";
  try {
    const expected = context.payload.pull_request;
    const parameters = { ...context.repo, pull_number: expected.number };
    const before = (await github.rest.pulls.get(parameters)).data;
    const files = await github.paginate(github.rest.pulls.listFiles, { ...parameters, per_page: 100 });
    const after = (await github.rest.pulls.get(parameters)).data;
    return classifyPullRequestFiles({
      head: expected.head.sha,
      base: expected.base.sha,
      before,
      after,
      files,
    });
  } catch {
    return "full";
  }
}

export function assertCiResult({ scope, classification, workflow, jobs }) {
  if (!["full", "documentation"].includes(scope) || classification !== "success" || workflow !== "success") {
    throw new Error("CI scope determination and the selected workflow must both succeed.");
  }
  if (!jobs || typeof jobs !== "object" || Array.isArray(jobs)) {
    throw new Error("The shared workflow did not return its job results.");
  }
  const names = Object.keys(jobs);
  if (names.length !== CI_JOBS.length || names.some((name) => !CI_JOBS.includes(name))) {
    throw new Error("The shared workflow returned an unexpected set of CI jobs.");
  }
  for (const name of CI_JOBS) {
    const expected = scope === "documentation" && name !== "linter" ? "skipped" : "success";
    if (jobs[name]?.result !== expected) {
      throw new Error(`CI job "${name}" must be ${expected} for ${scope} changes.`);
    }
  }
}

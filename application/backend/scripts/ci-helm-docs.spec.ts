import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it, vi } from "vitest";

const script = [resolve(process.cwd(), "../../scripts/ci-helm-docs.mjs"), "/usr/src/shared-scripts/ci-helm-docs.mjs"].find(existsSync);
if (!script) throw new Error("Unable to locate the Helm documentation scope script.");
const { needsHelmDocs } = await import(pathToFileURL(script).href);
const head = "a".repeat(40);
const previous = "b".repeat(40);
const context = {
  eventName: "push",
  ref: "refs/heads/main",
  sha: head,
  runId: 20,
  repo: { owner: "owner", repo: "repository" },
  payload: { repository: { default_branch: "main" }, before: "c".repeat(40) },
};
const baseline = { id: 10, head_sha: previous, head_branch: "main", event: "push", status: "completed", conclusion: "success" };

describe("main Helm documentation scope", () => {
  it.each([
    ["application/backend/src/main.ts\0", false],
    ["application/frontend/package-lock.json\0docs/guide.md\0e2e/example.ts\0README.md\0", false],
    ["", false],
    ["charts/application/values.yaml\0", true],
    ["charts/application/README.md\0", true],
    [".github/workflows/main-ci.yml\0", true],
    ["scripts/ci-helm-docs.mjs\0", true],
    [".prettierignore\0", true],
    ["unknown/file\0", true],
    ["charts/old.yaml\0application/new.yaml\0", true],
    ["application/old.yaml\0charts/new.yaml\0", true],
    ["docs/../charts/values.yaml\0", true],
    ["application/truncated", true],
    ["application/bad\npath\0", true],
  ])("selects generation safely for changed paths %j", async (changed, expected) => {
    // Arrange
    const github = { rest: { actions: { listWorkflowRuns: vi.fn().mockResolvedValue({ data: { workflow_runs: [baseline] } }) } } };
    const git = vi.fn().mockResolvedValueOnce(`${head}\n`).mockResolvedValueOnce("").mockResolvedValueOnce(changed);
    // Act
    const required = await needsHelmDocs({ github, context, attempt: 1, git });
    // Assert
    expect(required).toBe(expected);
  });

  it("includes pending chart changes from failed or cancelled intermediate pushes", async () => {
    // Arrange
    const github = { rest: { actions: { listWorkflowRuns: vi.fn().mockResolvedValue({ data: { workflow_runs: [baseline] } }) } } };
    const git = vi.fn(async (args: string[]) => {
      if (args[0] === "rev-parse") return head;
      if (args[0] === "merge-base") return "";
      return args.includes(previous) ? "charts/application/Chart.yaml\0application/new.ts\0" : "application/new.ts\0";
    });
    // Act
    const required = await needsHelmDocs({ github, context, attempt: 1, git });
    // Assert
    expect(required).toBe(true);
  });

  it.each([
    [],
    [{ ...baseline, conclusion: "failure" }],
    [{ ...baseline, status: "in_progress" }],
    [{ ...baseline, event: "pull_request" }],
    [{ ...baseline, head_branch: "other" }],
    [{ ...baseline, head_sha: "invalid" }],
    [{ ...baseline, id: context.runId }],
  ])("generates when a successful baseline cannot be established", async (...runs) => {
    // Arrange
    const github = { rest: { actions: { listWorkflowRuns: vi.fn().mockResolvedValue({ data: { workflow_runs: runs } }) } } };
    const git = vi.fn().mockResolvedValueOnce(head).mockResolvedValueOnce("").mockResolvedValueOnce("application/new.ts\0");
    // Act
    const required = await needsHelmDocs({ github, context, attempt: 1, git });
    // Assert
    expect(required).toBe(true);
  });

  it("generates when history is unavailable", async () => {
    // Arrange
    const github = { rest: { actions: { listWorkflowRuns: vi.fn().mockRejectedValue(new Error("API unavailable")) } } };
    // Act
    const required = await needsHelmDocs({ github, context, attempt: 1 });
    // Assert
    expect(required).toBe(true);
  });

  it.each(["checkout", "ancestry", "diff"])("generates after a Git %s failure", async (failure) => {
    // Arrange
    const github = { rest: { actions: { listWorkflowRuns: vi.fn().mockResolvedValue({ data: { workflow_runs: [baseline] } }) } } };
    const git = vi.fn(async (args: string[]) => {
      if (args[0] === "rev-parse") return failure === "checkout" ? previous : head;
      if (args[0] === "merge-base") {
        if (failure === "ancestry") throw new Error("Not an ancestor");
        return "";
      }
      if (failure === "diff") throw new Error("Git failed");
      return "application/new.ts\0";
    });
    // Act
    const required = await needsHelmDocs({ github, context, attempt: 1, git });
    // Assert
    expect(required).toBe(true);
  });

  it.each([
    { attempt: 2, current: context },
    { attempt: undefined, current: context },
    { attempt: 1, current: { ...context, eventName: "workflow_dispatch" } },
    { attempt: 1, current: { ...context, ref: "refs/heads/other" } },
  ])("keeps reruns and unsupported contexts on the generation path", async ({ attempt, current }) => {
    // Arrange
    const github = { rest: { actions: { listWorkflowRuns: vi.fn().mockResolvedValue({ data: { workflow_runs: [baseline] } }) } } };
    const git = vi.fn().mockResolvedValueOnce(head).mockResolvedValueOnce("").mockResolvedValueOnce("application/new.ts\0");
    // Act
    const required = await needsHelmDocs({ github, context: current, attempt, git });
    // Assert
    expect(required).toBe(true);
  });
});

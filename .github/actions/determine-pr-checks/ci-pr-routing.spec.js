import { describe, expect, it, vi } from "vitest";
import * as routing from "./ci-pr-routing.mjs";

const snapshot = { head: { sha: "head" }, base: { sha: "base" }, changed_files: 1 };
const documentation = { filename: "docs/technical/example.md", status: "modified" };
const identity = { head: "head", base: "base", before: snapshot, after: snapshot };
const successfulJobs = Object.fromEntries(
  [
    "linter",
    "check-user-guides",
    "check-ci-routing",
    "build-backend-ci-image",
    "check-backend",
    "build-frontend-ci-image",
    "check-frontend",
    "build-backend-candidate",
    "build-frontend-candidate",
    "tests-charts",
    "promote-images",
  ].map((name) => [name, { result: "success" }]),
);
const documentationJobs = Object.fromEntries(
  Object.keys(successfulJobs).map((name) => [name, { result: ["linter", "check-user-guides"].includes(name) ? "success" : "skipped" }]),
);

describe("pull request CI routing", () => {
  it.each([
    { filename: "README.md", status: "modified" },
    { filename: "docs/user/setup.md", status: "added" },
    { filename: "docs/old.md", status: "removed" },
    { filename: "docs/new.md", status: "renamed", previous_filename: "docs/old.md" },
  ])("routes supported documentation changes: $status $filename", (file) => {
    // Arrange
    const input = { ...identity, files: [file] };
    // Act
    const scope = routing.classifyPullRequestFiles(input);
    // Assert
    expect(scope).toBe("documentation");
  });

  it.each([
    "application/backend/src/schema.gql",
    "pnpm-lock.yaml",
    "scripts/check-pagination.mjs",
    "scripts/check-shared-domain-package.mjs",
    "application/contracts/game/index.ts",
    ".github/workflows/__shared-ci.yml",
    "application/backend/Dockerfile",
    "charts/application/Chart.yaml",
    "AGENTS.md",
    "unknown.md",
    "docs/../scripts/tool.md",
  ])("keeps mixed changes on full CI: %s", (filename) => {
    // Arrange
    const current = { ...snapshot, changed_files: 2 };
    const input = {
      ...identity,
      before: current,
      after: current,
      files: [documentation, { filename, status: "modified" }],
    };
    // Act
    const scope = routing.classifyPullRequestFiles(input);
    // Assert
    expect(scope).toBe("full");
  });

  it.each([
    { filename: "docs/new.md", status: "renamed", previous_filename: "application/frontend/code.ts" },
    { filename: "application/frontend/code.ts", status: "renamed", previous_filename: "docs/old.md" },
    { filename: "docs/new.md", status: "renamed" },
    { filename: "docs/new.md", status: "unknown" },
  ])("keeps unsafe or incomplete file metadata on full CI: $status $filename", (file) => {
    // Arrange
    const input = { ...identity, files: [file] };
    // Act
    const scope = routing.classifyPullRequestFiles(input);
    // Assert
    expect(scope).toBe("full");
  });

  it.each([
    { files: [] },
    { files: null },
    { before: { ...snapshot, changed_files: 2 } },
    { after: { ...snapshot, head: { sha: "new-head" } } },
    { after: { ...snapshot, base: { sha: "new-base" } } },
    {
      files: [documentation, documentation],
      before: { ...snapshot, changed_files: 2 },
      after: { ...snapshot, changed_files: 2 },
    },
  ])("keeps missing, truncated, duplicated or stale enumeration on full CI", (overrides) => {
    // Arrange
    const input = { ...identity, files: [documentation], ...overrides };
    // Act
    const scope = routing.classifyPullRequestFiles(input);
    // Assert
    expect(scope).toBe("full");
  });

  it("classifies a complete API enumeration against the triggering PR identity", async () => {
    // Arrange
    const github = {
      rest: { pulls: { get: vi.fn().mockResolvedValue({ data: snapshot }), listFiles: vi.fn() } },
      paginate: vi.fn().mockResolvedValue([documentation]),
    };
    const context = {
      eventName: "pull_request",
      repo: { owner: "owner", repo: "repository" },
      payload: { pull_request: { ...snapshot, number: 1 } },
    };
    // Act
    const scope = await routing.resolvePullRequestScope({ github, context });
    // Assert
    expect(scope).toBe("documentation");
  });

  it("falls back to full CI when the API is unavailable", async () => {
    // Arrange
    const github = { rest: { pulls: { get: vi.fn().mockRejectedValue(new Error("API unavailable")) } } };
    const context = {
      eventName: "pull_request",
      repo: { owner: "owner", repo: "repository" },
      payload: { pull_request: { ...snapshot, number: 1 } },
    };
    // Act
    const scope = await routing.resolvePullRequestScope({ github, context });
    // Assert
    expect(scope).toBe("full");
  });

  it.each(["push", "workflow_dispatch"])("keeps %s on full CI", async (eventName) => {
    // Arrange
    const input = { context: { eventName } };
    // Act
    const scope = await routing.resolvePullRequestScope(input);
    // Assert
    expect(scope).toBe("full");
  });
});

describe("PR CI result", () => {
  it.each([
    { scope: "full", jobs: successfulJobs },
    { scope: "documentation", jobs: documentationJobs },
  ])("accepts the complete expected $scope result", (route) => {
    // Arrange
    const input = { classification: "success", workflow: "success", ...route };
    // Act
    const validate = () => routing.assertCiResult(input);
    // Assert
    expect(validate).not.toThrow();
  });

  it.each(["failure", "cancelled", "skipped"])("rejects a %s application check on the full route", (result) => {
    // Arrange
    const input = {
      scope: "full",
      classification: "success",
      workflow: "success",
      jobs: { ...successfulJobs, "check-backend": { result } },
    };
    // Act
    const validate = () => routing.assertCiResult(input);
    // Assert
    expect(validate).toThrow("check-backend");
  });

  it.each([
    { ...documentationJobs, linter: { result: "skipped" } },
    { ...documentationJobs, "promote-images": { result: "success" } },
  ])("rejects unexpected results on the documentation route", (jobs) => {
    // Arrange
    const input = { scope: "documentation", classification: "success", workflow: "success", jobs };
    // Act
    const validate = () => routing.assertCiResult(input);
    // Assert
    expect(validate).toThrow("CI job");
  });

  it.each([
    { classification: "failure" },
    { workflow: "cancelled" },
    { scope: "" },
    { jobs: null },
    { jobs: { linter: { result: "success" } } },
    { jobs: { ...successfulJobs, unplanned: { result: "skipped" } } },
  ])("rejects missing outcomes or an unexpected job set", (overrides) => {
    // Arrange
    const input = { scope: "full", classification: "success", workflow: "success", jobs: successfulJobs, ...overrides };
    // Act
    const validate = () => routing.assertCiResult(input);
    // Assert
    expect(validate).toThrow();
  });
});

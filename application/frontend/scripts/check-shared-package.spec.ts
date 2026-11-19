// @vitest-environment node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  PlayableContentImportErrorKind,
  PredictionErrorCode,
  QuizErrorCode,
  resolvePlayableContentImportErrorKind,
} from "@pleey/domain/errors";
import { describe, expect, it } from "vitest";

const scriptPath = [
  path.resolve(import.meta.dirname, "../../../scripts/check-shared-domain-package.mjs"),
  "/usr/src/shared-scripts/check-shared-domain-package.mjs",
].find((candidate) => fs.existsSync(candidate));

if (!scriptPath) {
  throw new Error("Unable to locate the shared domain package checker script for tests.");
}

const { checkPackageApiSurface, checkPartyRealtimeFixtures, checkSharedSourceImports } = await import(
  pathToFileURL(scriptPath).href
);

describe("shared domain package checker", () => {
  it.each([
    [QuizErrorCode.QUIZ_IMPORT_EMPTY_FILE, PlayableContentImportErrorKind.EmptyFile],
    [QuizErrorCode.QUIZ_IMPORT_UNSUPPORTED_FORMAT, PlayableContentImportErrorKind.UnsupportedFormat],
    [PredictionErrorCode.PREDICTION_IMPORT_INVALID_FILE, PlayableContentImportErrorKind.InvalidFile],
  ])("classifies the shared import error %s", (code, expectedKind) => {
    // Act
    const kind = resolvePlayableContentImportErrorKind(code);

    // Assert
    expect(kind).toBe(expectedKind);
  });

  it("does not classify unrelated business errors as import failures", () => {
    // Act
    const kind = resolvePlayableContentImportErrorKind(QuizErrorCode.QUIZ_NOT_FOUND);

    // Assert
    expect(kind).toBeNull();
  });

  it("rejects export surface drift", () => {
    // Arrange
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "pleey-shared-package-"));
    const packageRoot = path.join(tempDirectory, "packages/pleey-domain");
    fs.mkdirSync(packageRoot, { recursive: true });
    fs.writeFileSync(
      path.join(packageRoot, "package.json"),
      JSON.stringify({
        name: "@pleey/domain",
        exports: {
          ".": "./empty.js",
          "./extra": "./extra.js",
        },
      }),
    );

    // Act + Assert
    try {
      expect(() => checkPackageApiSurface(packageRoot)).toThrow("Unexpected shared package exports");
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });

  it("rejects forbidden framework imports in shared sources", () => {
    // Arrange
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "pleey-shared-imports-"));
    const packageRoot = path.join(tempDirectory, "packages/pleey-domain");
    fs.mkdirSync(path.join(packageRoot, "src"), { recursive: true });
    fs.writeFileSync(path.join(packageRoot, "src", "policy.ts"), "import { useMemo } from 'react';");

    // Act + Assert
    try {
      expect(() => checkSharedSourceImports(packageRoot)).toThrow("Forbidden imports detected");
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });

  it("rejects fixture drift for realtime contract coverage", () => {
    // Arrange
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "pleey-shared-fixtures-"));
    const fixturePath = path.join(tempDirectory, "party-realtime-events.json");
    const fixture = {
      validClientToServerEvents: ["join-party"],
      invalidClientToServerEvents: [],
      validServerToClientEvents: ["party-snapshot"],
      invalidServerToClientEvents: [],
    };
    fs.writeFileSync(fixturePath, JSON.stringify(fixture));
    const backendEventsPath = [
      path.resolve(import.meta.dirname, '../../../application/backend/src/presentation/game/party/realtime/party-socket-events.ts'),
      '/usr/src/backend/src/presentation/game/party/realtime/party-socket-events.ts',
      '/usr/src/app/src/presentation/game/party/realtime/party-socket-events.ts',
      '/usr/application/backend/src/presentation/game/party/realtime/party-socket-events.ts',
    ].find((candidate) => fs.existsSync(candidate));
    const frontendEventsPath = path.resolve(
      import.meta.dirname,
      "../src/infrastructure/game/party/shared/socket-io-party-realtime.types.ts",
    );
    const sharedPartyEventsPath = [
      path.resolve(import.meta.dirname, '../../../packages/pleey-domain/party/index.js'),
      '/usr/packages/pleey-domain/party/index.js',
    ].find((candidate) => {
      return fs.existsSync(candidate);
    });

    // Act + Assert
    try {
      expect(() =>
        checkPartyRealtimeFixtures({
          backendEventsPath,
          frontendEventsPath,
          fixturePath,
          sharedPartyEventsPath,
        }),
      ).toThrow("Client-to-server fixture events must match backend inbound events");
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });
});

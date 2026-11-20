// @vitest-environment node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  IdentifierParserErrorCode,
  PlayableContentImportErrorKind,
  PredictionErrorCode,
  QuizErrorCode,
  resolvePlayableContentImportErrorKind,
} from "@pleey/contracts/errors";
import { SHARED_ERROR_TRANSLATION_KEYS, SHARED_TRANSLATIONS } from "@pleey/contracts/i18n";
import { THEME_ASSET_POLICY, THEME_ERROR_TRANSLATION_KEYS, ThemeErrorCode } from "@pleey/contracts/theme";
import { describe, expect, it } from "vitest";

const scriptPath = [
  path.resolve(import.meta.dirname, "../../../scripts/check-shared-domain-package.mjs"),
  "/usr/src/shared-scripts/check-shared-domain-package.mjs",
].find((candidate) => fs.existsSync(candidate));

if (!scriptPath) {
  throw new Error("Unable to locate the shared domain package checker script for tests.");
}

const {
  checkPackageApiSurface,
  checkPartyRealtimeFixtures,
  checkSharedSourceImports,
  checkSupersededApplicationContracts,
} = await import(pathToFileURL(scriptPath).href);

describe("shared domain package checker", () => {
  it("exposes one bounded theme asset policy", () => {
    // Act + Assert
    expect(THEME_ASSET_POLICY.acceptedMimeTypes).toEqual(["image/png", "image/jpeg", "image/webp"]);
    expect(THEME_ASSET_POLICY.maxFileSizeBytes).toBe(5 * 1024 * 1024);
    expect(THEME_ASSET_POLICY.maxInputPixels).toBe(16_000_000);
  });

  it("keeps public identifier and theme error vocabulary stable", () => {
    // Act + Assert
    expect(IdentifierParserErrorCode.INVALID_VALUE).toBe("shared.errors.identifier.invalidValue");
    expect(THEME_ERROR_TRANSLATION_KEYS).toEqual({
      [ThemeErrorCode.INVALID_DOCUMENT]: "theme.errors.invalidDocument",
      [ThemeErrorCode.INVALID_SELECTION]: "theme.errors.invalidSelection",
      [ThemeErrorCode.REVISION_CONFLICT]: "theme.errors.revisionConflict",
      [ThemeErrorCode.INVALID_ASSET]: "theme.errors.invalidAsset",
      [ThemeErrorCode.NOT_FOUND]: "theme.errors.notFound",
    });
  });

  it("defines each shared error translation key in every supported locale", () => {
    // Arrange
    const entries = Object.values(SHARED_ERROR_TRANSLATION_KEYS);

    // Act
    const missing = Object.entries(SHARED_TRANSLATIONS).flatMap(([locale, resources]) =>
      entries
        .filter((key) => key.split(".").reduce<unknown>((value, part) => (value as Record<string, unknown>)?.[part], resources) === undefined)
        .map((key) => `${locale}:${key}`),
    );

    // Assert
    expect(missing).toEqual([]);
  });

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

  it("rejects restored shared-contract wrappers", () => {
    // Arrange
    const repositoryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "pleey-restored-contract-"));
    const wrapperPath = path.join(repositoryRoot, "apps/api/src/domain/game/entities/game.ts");
    fs.mkdirSync(path.dirname(wrapperPath), { recursive: true });
    fs.writeFileSync(wrapperPath, "export type GameId = string;");

    // Act + Assert
    try {
      expect(() => checkSupersededApplicationContracts(repositoryRoot)).toThrow(
        "Superseded application contracts must remain removed",
      );
    } finally {
      fs.rmSync(repositoryRoot, { recursive: true, force: true });
    }
  });

  it("rejects export surface drift", () => {
    // Arrange
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "pleey-shared-package-"));
    const packageRoot = path.join(tempDirectory, "packages/contracts");
    fs.mkdirSync(packageRoot, { recursive: true });
    fs.writeFileSync(
      path.join(packageRoot, "package.json"),
      JSON.stringify({
        name: "@pleey/contracts",
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

  it("rejects package file-surface drift", () => {
    // Arrange
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "pleey-shared-files-"));
    const sourcePackageRoot = [
      path.resolve(import.meta.dirname, "../../../packages/contracts"),
        "/usr/src/shared",
    ].find((candidate) => fs.existsSync(candidate));
    if (!sourcePackageRoot) throw new Error("Unable to locate the shared domain package for tests.");
    const packageRoot = path.join(tempDirectory, "pleey-domain");
    fs.cpSync(sourcePackageRoot, packageRoot, { recursive: true });
    const packageJsonPath = path.join(packageRoot, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    packageJson.files.push("unexpected/");
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));

    // Act + Assert
    try {
      expect(() => checkPackageApiSurface(packageRoot)).toThrow("Unexpected shared package files");
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });

  it("rejects forbidden framework imports in shared sources", () => {
    // Arrange
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "pleey-shared-imports-"));
    const packageRoot = path.join(tempDirectory, "packages/contracts");
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
      path.resolve(import.meta.dirname, '../../../apps/api/src/presentation/game/party/realtime/party-socket-events.ts'),
      '/usr/src/backend/src/presentation/game/party/realtime/party-socket-events.ts',
      '/usr/src/app/src/presentation/game/party/realtime/party-socket-events.ts',
      '/usr/apps/api/src/presentation/game/party/realtime/party-socket-events.ts',
    ].find((candidate) => fs.existsSync(candidate));
    const frontendEventsPath = path.resolve(
      import.meta.dirname,
      "../src/infrastructure/game/party/shared/socket-io-party-realtime.types.ts",
    );
    const sharedPartyEventsPath = [
      path.resolve(import.meta.dirname, '../../../packages/contracts/party/index.ts'),
      '/usr/src/shared/party/index.ts',
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

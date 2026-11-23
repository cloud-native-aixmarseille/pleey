import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = path.resolve(import.meta.dirname, "../../..");
const read = (relativePath) => fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");

describe("shared package Docker wiring", () => {
  it.each(["backend", "frontend"])("copies the shared package into the %s build and CI images", (application) => {
    // Arrange
    const dockerfile = read(`application/${application}/Dockerfile`);

    // Act + Assert
    expect(dockerfile).toContain("COPY ./application/contracts /usr/src/shared");
    expect(dockerfile).toContain("COPY --chown=node:node --from=build /usr/src/shared /usr/src/shared");
  });

  it("keeps the shared package in the backend production image", () => {
    // Arrange
    const dockerfile = read("application/backend/Dockerfile");

    // Act + Assert
    expect(dockerfile).toContain(
      "COPY --chown=node:node --from=build-prod /usr/src/shared /usr/src/shared",
    );
  });

  it("makes shared sources available to CI documentation checks", () => {
    // Arrange
    const dockerfile = read("application/frontend/Dockerfile");

    // Act + Assert
    expect(dockerfile).toContain(
      "COPY --chown=node:node ./application/contracts /usr/src/repository/application/contracts",
    );
  });

  it("keeps shared sources inside the Docker build context", () => {
    // Arrange
    const dockerignore = read(".dockerignore");
    const compose = read("compose.yaml");

    // Act + Assert
    expect(dockerignore).not.toMatch(/^application\/?$/mu);
    expect(dockerignore).not.toContain("application/contracts");
    expect(compose).toContain("- ./application/contracts:/usr/src/shared:ro");
  });

  it.each(["backend", "frontend"])("keeps the %s file dependency lock aligned with the package", (application) => {
    // Arrange
    const packageJson = JSON.parse(read(`application/${application}/package.json`));
    const packageLock = JSON.parse(read(`application/${application}/pnpm-lock.yaml`));

    // Act + Assert
    expect(packageJson.dependencies["@pleey/contracts"]).toBe("file:../shared");
    expect(packageLock.packages["node_modules/@pleey/contracts"].resolved).toBe("../shared");
    expect(packageLock.packages["../shared"].name).toBe("@pleey/contracts");
  });
});

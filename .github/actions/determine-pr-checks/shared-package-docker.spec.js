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
    expect(dockerfile).toContain("COPY ./packages/pleey-domain /usr/packages/pleey-domain");
    expect(dockerfile).toContain("COPY --chown=node:node --from=build /usr/packages/pleey-domain /usr/packages/pleey-domain");
  });

  it("keeps the shared package in the backend production image", () => {
    // Arrange
    const dockerfile = read("application/backend/Dockerfile");

    // Act + Assert
    expect(dockerfile).toContain(
      "COPY --chown=node:node --from=build-prod /usr/packages/pleey-domain /usr/packages/pleey-domain",
    );
  });

  it("makes shared sources available to CI documentation checks", () => {
    // Arrange
    const dockerfile = read("application/frontend/Dockerfile");

    // Act + Assert
    expect(dockerfile).toContain(
      "COPY --chown=node:node ./packages/pleey-domain /usr/src/repository/packages/pleey-domain",
    );
  });

  it("keeps shared sources inside the Docker build context", () => {
    // Arrange
    const dockerignore = read(".dockerignore");
    const compose = read("compose.yaml");

    // Act + Assert
    expect(dockerignore).not.toMatch(/^packages\/?$/mu);
    expect(dockerignore).not.toContain("packages/pleey-domain");
    expect(compose).toContain("- ./packages:/usr/packages:ro");
  });

  it.each(["backend", "frontend"])("keeps the %s file dependency lock aligned with the package", (application) => {
    // Arrange
    const packageJson = JSON.parse(read(`application/${application}/package.json`));
    const packageLock = JSON.parse(read(`application/${application}/package-lock.json`));

    // Act + Assert
    expect(packageJson.dependencies["@pleey/domain"]).toBe("file:../../packages/pleey-domain");
    expect(packageLock.packages["node_modules/@pleey/domain"].resolved).toBe("../../packages/pleey-domain");
    expect(packageLock.packages["../../packages/pleey-domain"].name).toBe("@pleey/domain");
  });
});

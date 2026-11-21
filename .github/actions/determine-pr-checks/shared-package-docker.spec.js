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
    expect(dockerfile).toContain("COPY application/contracts ./application/contracts");
    expect(dockerfile).toMatch(
      /COPY --chown=(?:node:node|1000:1000) --from=build \/usr\/src\/repository \/usr\/src\/app/u,
    );
    expect(dockerfile).toContain("pnpm@10.32.1");
  });

  it("keeps the shared package in the backend production image", () => {
    // Arrange
    const dockerfile = read("application/backend/Dockerfile");

    // Act + Assert
    expect(dockerfile).toContain("/usr/src/repository/application/contracts");
  });

  it("makes shared sources available to CI documentation checks", () => {
    // Arrange
    const dockerfile = read("application/frontend/Dockerfile");

    // Act + Assert
    expect(dockerfile).toContain("COPY application/contracts ./application/contracts");
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

  it.each(["backend", "frontend"])("uses workspace dependencies in the %s package", (application) => {
    // Arrange
    const packageJson = JSON.parse(read(`application/${application}/package.json`));

    // Act + Assert
    expect(packageJson.dependencies["@pleey/contracts"]).toBe("workspace:*");
  });
});

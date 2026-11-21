import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

const checkerPath = [
  resolve(process.cwd(), "../../scripts/check-resolver-use-cases.mjs"),
  "/usr/src/shared-scripts/check-resolver-use-cases.mjs",
].find(existsSync);
if (!checkerPath) throw new Error("Unable to locate the resolver guard.");
const checkerUrl = pathToFileURL(checkerPath).href;

const definitions = `
  import { Query, Resolver } from './decorators';
  import { ReadThemeUseCase } from '../application/themes/use-cases/read-theme-use-case';
`;

describe("GraphQL resolver use-case guard", () => {
  it.each([
    [
      "accepts use-case delegation",
      "",
      "constructor(private useCase: ReadThemeUseCase) {} @Query() read() { return this.useCase.execute(); }",
      false,
    ],
    [
      "accepts a local transport helper",
      "",
      "constructor(private useCase: ReadThemeUseCase) {} @Query() read() { return this.load(); } private load() { return this.useCase.execute(); }",
      false,
    ],
    [
      "accepts identifier parsing",
      "import { ThemeIdentifier } from '../application/themes/services/theme-identifier';",
      'constructor(private useCase: ReadThemeUseCase, private identifier: ThemeIdentifier) {} @Query() read() { return this.useCase.execute(this.identifier.parse("id")); }',
      false,
    ],
    [
      "accepts field projection",
      "import { ResolveField } from './decorators';",
      '@ResolveField() label() { return "label"; }',
      false,
    ],
    [
      "accepts aliased use cases",
      "import { ReadThemeUseCase as ReadTheme } from '../application/themes/use-cases/read-theme-use-case';",
      "constructor(private useCase: ReadTheme) {} @Query() read() { return this.useCase.execute(); }",
      false,
    ],
    [
      "rejects aliased query decorators without a use case",
      "import { Query as Read } from './decorators';",
      "@Read() read() { return []; }",
      true,
    ],
    [
      "rejects mutations without a use case",
      "import { Mutation } from './decorators';",
      "@Mutation() save() { return true; }",
      true,
    ],
    [
      "rejects subscriptions without a use case",
      "import { Subscription } from './decorators';",
      "@Subscription() changes() { return []; }",
      true,
    ],
    ["rejects operations without use cases", "", "@Query() read() { return []; }", true],
    [
      "rejects business services even with an execute method",
      "import { ThemeService } from '../application/themes/services/theme-service';",
      "constructor(private service: ThemeService) {} @Query() read() { return this.service.execute(); }",
      true,
    ],
    [
      "rejects a service hidden behind an alias and barrel",
      "import { HiddenService as ReadTheme } from '../application/themes';",
      "constructor(private service: ReadTheme, private useCase: ReadThemeUseCase) {} @Query() read() { this.service.execute(); return this.useCase.execute(); }",
      true,
    ],
    [
      "rejects repository ports",
      "import type { ThemeRepository } from '../domain/theme/ports/theme-repository';",
      "constructor(private repository: ThemeRepository, private useCase: ReadThemeUseCase) {} @Query() read() { this.repository.find(); return this.useCase.execute(); }",
      true,
    ],
    [
      "rejects infrastructure adapters",
      "import { PrismaThemeRepository } from '../infrastructure/theme/prisma-theme-repository';",
      "constructor(private repository: PrismaThemeRepository, private useCase: ReadThemeUseCase) {} @Query() read() { this.repository.find(); return this.useCase.execute(); }",
      true,
    ],
    [
      "rejects non-execute use-case methods",
      "",
      "constructor(private useCase: ReadThemeUseCase) {} @Query() read() { return this.useCase.read(); }",
      true,
    ],
  ])("%s", async (_name, imports, members, rejected) => {
    // Arrange
    const { checkResolverUseCases } = await import(checkerUrl);
    const root = mkdtempSync(join(tmpdir(), "pleey-resolver-guard-"));
    symlinkSync(resolve(process.cwd(), "node_modules"), join(root, "node_modules"), "dir");
    const files = {
      "tsconfig.json": JSON.stringify({
        compilerOptions: { noLib: true, types: [], experimentalDecorators: true },
        include: ["src/**/*.ts"],
      }),
      "src/presentation/decorators.ts":
        "export declare function Resolver(): ClassDecorator; export declare function Query(): MethodDecorator; export declare function Mutation(): MethodDecorator; export declare function Subscription(): MethodDecorator; export declare function ResolveField(): MethodDecorator;",
      "src/application/themes/use-cases/read-theme-use-case.ts":
        "export class ReadThemeUseCase { execute(id?: string) { return id; } read() { return 1; } }",
      "src/application/themes/services/theme-service.ts": "export class ThemeService { execute() { return 1; } }",
      "src/application/themes/services/theme-identifier.ts":
        "export class ThemeIdentifier { parse(id: string) { return id; } }",
      "src/application/themes/index.ts": 'export { ThemeService as HiddenService } from "./services/theme-service";',
      "src/domain/theme/ports/theme-repository.ts": "export interface ThemeRepository { find(): unknown; }",
      "src/infrastructure/theme/prisma-theme-repository.ts":
        "export class PrismaThemeRepository { find() { return 1; } }",
      "src/presentation/transport.ts": `${definitions}\n${imports}\n@Resolver() class ThemeResolver { ${members} }`,
    };
    try {
      for (const [name, content] of Object.entries(files)) {
        mkdirSync(dirname(join(root, name)), { recursive: true });
        writeFileSync(join(root, name), content);
      }
      // Act
      const violations = checkResolverUseCases({ root });
      // Assert
      expect(violations.length > 0).toBe(rejected);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

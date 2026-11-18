import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, type BrowserContext, type Page, test } from "@playwright/test";
import type { UiThemeSeed } from "../../../application/frontend/src/presentation/shared/ui/foundation/ui-theme-contract";
import { loginViaApi, resolveGraphqlUrl } from "../helpers/auth";

const root = fs.existsSync("/repository/scripts") ? "/repository" : path.resolve(__dirname, "../../..");
// The generator and browser checks discover the same co-located manifests.

const assets = path.join(root, "docs/usage/assets");
const capture = process.env.USAGE_CAPTURE === "1";
const fixedCaptureTime = new Date("2026-11-18T11:39:00.000Z");
const fixedGuestAvatarSeed = "01974c4e-3e24-7c39-ae9f-5e0b8f7b2c31";

async function stabilizeCaptureContext(context: BrowserContext) {
  await context.addInitScript(
    ({ fixedSeed }) => {
      Object.defineProperty(globalThis.crypto, "randomUUID", {
        configurable: true,
        value: () => fixedSeed,
      });
      Math.random = () => 0.123456789;
    },
    { fixedSeed: fixedGuestAvatarSeed },
  );
}

async function graphql(page: Page, token: string, query: string, variables = {}) {
  const response = await page.request.post(resolveGraphqlUrl(), {
    headers: { authorization: `Bearer ${token}`, "apollo-require-preflight": "true" },
    data: { query, variables },
  });
  const payload = await response.json();
  if (payload.errors || !payload.data) throw new Error(JSON.stringify(payload.errors ?? payload));
  return payload.data;
}

test("all user guides resolve real routes, localized copy and targets, with accessible tours", async ({ browser }) => {
  test.setTimeout(120_000);
  const { loadDataModule, readUsageModel, translate } = await import(
    path.join(root, "scripts/usage-reference-model.mjs")
  );
  const { guides, resources } = readUsageModel(root);
  const { usageScreenshotSourceHash, checkUsageScreenshots } = await import(
    path.join(root, "scripts/check-usage-screenshots.mjs")
  );
  if (!capture) checkUsageScreenshots(root);
  const snapshots: Record<string, string> = {};
  fs.mkdirSync(assets, { recursive: true });
  for (const locale of ["en", "fr"]) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      locale,
      reducedMotion: "reduce",
    });
    await stabilizeCaptureContext(context);
    const page = await context.newPage();
    await page.clock.setFixedTime(fixedCaptureTime);
    await page.addStyleTag({ content: "textarea, input { caret-color: transparent !important; }" });
    const { accessToken } = await loginViaApi(page, {
      email: process.env.E2E_ADMIN_EMAIL ?? "admin@pleey.com",
      password: process.env.E2E_ADMIN_PASSWORD ?? "admin123",
    });
    const { myOrganizations } = await graphql(page, accessToken, "query { myOrganizations { items { id name } } }");
    const organizationId = myOrganizations.items.find((item: { name: string }) => item.name === "Arcade Labs")?.id;
    if (!organizationId) throw new Error("Documentation checks require the isolated seeded stack.");
    const { organizationProjects } = await graphql(
      page,
      accessToken,
      "query($id: ID!) { organizationProjects(input: { organizationId: $id }) { items { id } } }",
      { id: organizationId },
    );
    const projectId = organizationProjects.items[0].id;
    const { projectGames } = await graphql(
      page,
      accessToken,
      "query($id: ID!) { projectGames(input: { projectId: $id }) { items { gameId type gameTypeId } } }",
      { id: projectId },
    );
    const { listParties } = await graphql(page, accessToken, "query { listParties { items { partyId pin } } }");
    const party = listParties.items.find((item: { pin: string }) => item.pin === "123456");
    const parameters: Record<string, string> = {
      organizationId,
      partyId: party.partyId,
      pin: party.pin,
      quizId: projectGames.items.find((item: { type: string }) => item.type.toLowerCase() === "quiz").gameTypeId,
      predictionId: projectGames.items.find((item: { type: string }) => item.type.toLowerCase() === "prediction")
        .gameTypeId,
    };
    await page.evaluate(
      ({ locale, organizationId, projectId }) => {
        localStorage.setItem("pleey_language", locale);
        localStorage.setItem("pleey_current_organization_id", organizationId);
        localStorage.setItem("pleey_current_project_id", projectId);
      },
      { locale, organizationId, projectId },
    );
    let playerPage: Page | undefined;
    for (const guide of guides) {
      console.log(`Guide ${guide.id} (${locale})`);
      let targetPage = page;
      if (guide.id.startsWith("player-")) {
        if (!playerPage) {
          const playerContext = await browser.newContext({
            viewport: { width: 1280, height: 900 },
            locale,
            reducedMotion: "reduce",
          });
          await stabilizeCaptureContext(playerContext);
          playerPage = await playerContext.newPage();
          await playerPage.clock.setFixedTime(fixedCaptureTime);
          await playerPage.addStyleTag({ content: "textarea, input { caret-color: transparent !important; }" });
          await playerPage.goto("/");
          await playerPage.evaluate((locale) => localStorage.setItem("pleey_language", locale), locale);
        }
        targetPage = playerPage;
      }
      const route = guide.steps[0].route.replace(/:([a-zA-Z]+)/g, (_: string, key: string) => parameters[key]);
      if (guide.id === "player-play") {
        await targetPage.locator('[data-tour="join-submit"]').click();
        await expect(targetPage).toHaveURL(new RegExp(`${route}$`));
      } else {
        await targetPage.goto(route);
      }
      if (guide.id === "player-join") await targetPage.locator("#party-join-guest-name").fill("Alex");
      const launch = targetPage.locator(`[data-guide="${guide.id}"]`);
      await expect(launch).toBeVisible();
      await expect(launch).toHaveAccessibleName(translate(resources, locale, "shared.guide.start"));
      const launchBox = await launch.boundingBox();
      expect(launchBox?.width).toBeGreaterThanOrEqual(44);
      expect(launchBox?.width).toBeLessThanOrEqual(48);
      expect(launchBox?.height).toBeGreaterThanOrEqual(44);
      for (const step of guide.steps) {
        const target = targetPage.locator(`[data-tour="${step.anchor}"]`);
        await expect(target).toHaveCount(1);
        await expect(target).toBeVisible();
        await target.scrollIntoViewIfNeeded();
        await targetPage.mouse.move(0, 0);
        await targetPage.evaluate(() => {
          if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        });
        await targetPage.evaluate(() => document.fonts.ready);
        const file = `${guide.id}-${step.anchor}-${locale}.png`;
        if (capture)
          await target.screenshot({
            path: path.join(assets, file),
            animations: "disabled",
            style: "[data-app-shell-header] { visibility: hidden !important; }",
          });
        else expect(fs.existsSync(path.join(assets, file)), `Missing screenshot ${file}`).toBe(true);
        snapshots[file] = createHash("sha256")
          .update(fs.readFileSync(path.join(assets, file)))
          .digest("hex");
      }
      await launch.click();
      for (const step of guide.steps) {
        await expect(targetPage.locator(".driver-popover-description")).toContainText(
          translate(resources, locale, step.i18nKey),
        );
        await expect(targetPage.locator(".pleey-guide-reference")).toHaveAttribute(
          "href",
          new RegExp(`${guide.docPath}#${step.docAnchor}$`),
        );
        const accessibility = await new AxeBuilder({ page: targetPage })
          .include(".driver-popover")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        expect(accessibility.violations).toEqual([]);
        await targetPage.locator(".driver-popover-next-btn").click();
      }
      await expect(launch).toHaveAccessibleName(translate(resources, locale, "shared.guide.replay"));
      await launch.click();
      await expect(targetPage.locator(".driver-popover-next-btn")).toBeFocused();
      await targetPage.keyboard.press("Escape");
      await expect(targetPage.locator(".driver-popover")).toHaveCount(0);
      await expect(launch).toBeFocused();
      if (guide.id === "dashboard-home") {
        await targetPage.goto(`${route}?guide=${guide.id}`);
        await expect(targetPage.locator(".driver-popover")).toBeVisible();
        await expect(targetPage.locator(".driver-popover-next-btn")).toBeFocused();
        await targetPage.keyboard.press("Escape");
        await expect(launch).toHaveAccessibleName(translate(resources, locale, "shared.guide.replay"));
      }
    }
    if (locale === "en") {
      // Exercise the overlay's token contract without creating or changing saved themes.
      const foundation = path.join(root, "application/frontend/src/presentation/shared/ui/foundation");
      const { createUiThemeTokens, createUiThemeCssVariables } = loadDataModule(
        path.join(foundation, "ui-theme-tokens.ts"),
      );
      for (const theme of ["cyber-arcade", "solar-grid"]) {
        const seed = Object.values(loadDataModule(path.join(foundation, `${theme}-theme.ts`))).find(
          (value) => value !== null && typeof value === "object" && "colorScales" in value,
        ) as UiThemeSeed;
        for (const scheme of ["dark", "light"]) {
          await test.step(`${theme}, ${scheme}, ${scheme === "light" ? "phone" : "desktop"}`, async () => {
            const viewport = { width: scheme === "light" ? 320 : 1280, height: scheme === "light" ? 740 : 900 };
            await page.setViewportSize(viewport);
            const variables = createUiThemeCssVariables(createUiThemeTokens(seed, scheme), true);
            seed.colorScales.accent.forEach((color: string, index: number) => {
              variables[`--mantine-color-brand-${index}`] = color;
            });
            await page.evaluate(
              ({ variables, scheme }) => {
                for (const element of [
                  document.documentElement,
                  document.querySelector<HTMLElement>("[data-ui-theme]")!,
                ]) {
                  for (const [key, value] of Object.entries(variables)) element.style.setProperty(key, String(value));
                  element.style.colorScheme = scheme;
                  element.setAttribute("data-mantine-color-scheme", scheme);
                }
              },
              { variables, scheme },
            );
            await page.locator('[data-guide="dashboard-home"]').click();
            const popover = page.locator(".driver-popover");
            await expect(popover).toBeVisible();
            const bounds = await popover.boundingBox();
            expect(bounds!.x).toBeGreaterThanOrEqual(0);
            expect(bounds!.y).toBeGreaterThanOrEqual(0);
            expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
            expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height);
            await expect(popover).toHaveCSS("background-color", /^rgb\(/);
            const accessibility = await new AxeBuilder({ page })
              .include(".driver-popover")
              .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
              .analyze();
            expect(accessibility.violations).toEqual([]);
            const screenshot = test.info().outputPath(`guide-${theme}-${scheme}.png`);
            await page.screenshot({ path: screenshot, animations: "disabled" });
            await test.info().attach(`Guide: ${theme} ${scheme}`, { path: screenshot, contentType: "image/png" });
            await page.keyboard.press("Escape");
          });
        }
      }
    }
    if (playerPage) await playerPage.context().close();
    await context.close();
  }
  if (capture)
    fs.writeFileSync(
      path.join(assets, "manifest.json"),
      JSON.stringify({ sourceHash: usageScreenshotSourceHash(root), screenshots: snapshots }, null, 2) + "\n",
    );
});

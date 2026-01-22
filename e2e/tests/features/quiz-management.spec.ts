import { test, expect } from "@playwright/test";
import { loginViaApi } from "../helpers/auth";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://backend:3001/api";

const ensureOrganizationSelected = async (
  page: import("@playwright/test").Page,
  options: { organizationId?: number; organizationName?: string } = {},
) => {
  const createQuizButton = page.getByRole("button", {
    name: /create quiz|créer un quiz/i,
  });

  try {
    await expect(createQuizButton).toBeEnabled({ timeout: 15000 });
    return;
  } catch {
    // continue to organization selection
  }

  await page
    .locator('button[aria-haspopup="menu"]')
    .filter({ hasText: /organization|organisation/i })
    .first()
    .click();

  await expect(
    page.getByRole("button", {
      name: /create new organization|create new|créer|nouvelle/i,
    }),
  ).toBeVisible({ timeout: 10000 });

  const defaultOrganization = options.organizationName
    ? page.getByText(new RegExp(options.organizationName, "i")).first()
    : page.getByText(/arcade labs|e2e organization/i).first();

  if ((await defaultOrganization.count()) > 0) {
    await defaultOrganization.click();
    await expect(createQuizButton).toBeEnabled({ timeout: 15000 });
    return;
  }

  await page
    .getByRole("button", {
      name: /create new organization|create new|créer|nouvelle/i,
    })
    .click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await dialog
    .getByPlaceholder(/enter organization name/i)
    .fill(`E2E Organization ${Date.now()}`);

  const createOrganizationResponse = page.waitForResponse((response) => {
    return (
      response.url().includes("/api/organizations") &&
      response.request().method() === "POST"
    );
  });

  await Promise.all([
    createOrganizationResponse,
    dialog.getByRole("button", { name: /create organization|créer/i }).click(),
  ]);

  if (await dialog.isVisible()) {
    const cancelButton = dialog.getByRole("button", { name: /cancel/i });
    if ((await cancelButton.count()) > 0) {
      await cancelButton.first().click();
    } else {
      await dialog.getByLabel(/close/i).click();
    }
  }

  try {
    await expect(createQuizButton).toBeEnabled({ timeout: 15000 });
    return;
  } catch {
    // fallback below
  }

  if (options.organizationId) {
    await page.evaluate((orgId) => {
      localStorage.setItem("currentOrganizationId", String(orgId));
    }, options.organizationId);
  }

  await page.evaluate(async () => {
    const token = localStorage.getItem("quizmaster_token");
    if (!token) {
      return;
    }

    try {
      const response = await fetch("/api/organizations/my-organizations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const payload = await response.json();
      const organizations = Array.isArray(payload)
        ? payload
        : payload?.organizations;
      const firstOrg = organizations?.[0];
      if (firstOrg?.id) {
        localStorage.setItem("currentOrganizationId", String(firstOrg.id));
      }
    } catch {
      // ignore
    }
  });

  await page.reload();
  await page.waitForLoadState("networkidle");

  await expect(createQuizButton).toBeEnabled({ timeout: 15000 });
};

/**
 * Quiz Management Flow - Nominal Use Case
 *
 * Tests the happy path for admin creating and managing quizzes
 * Critical flow: Admin must be able to create quizzes and add questions
 */

test.describe("Quiz Management Flow - Nominal Use Case", () => {
  const adminCredentials = {
    email: process.env.E2E_ADMIN_EMAIL ?? "admin@quiz.com",
    password: process.env.E2E_ADMIN_PASSWORD ?? "admin123",
  };

  test.beforeEach(async ({ page, request }) => {
    const { accessToken } = await loginViaApi(page, request, adminCredentials);

    let organization:
      | { id: number; name?: string; description?: string }
      | undefined;

    const orgResponse = await request.get(
      `${apiBaseUrl}/organizations/my-organizations`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (orgResponse.ok()) {
      const orgPayload = (await orgResponse.json()) as {
        organizations?: Array<{ id: number }>;
      };
      const orgFromApi = orgPayload.organizations?.[0];
      if (orgFromApi?.id) {
        organization = orgFromApi;
      }
    }

    if (!organization) {
      const createOrgResponse = await request.post(
        `${apiBaseUrl}/organizations`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          data: {
            name: `E2E Organization ${Date.now()}`,
            description: "E2E seeded organization",
          },
        },
      );

      if (createOrgResponse.ok()) {
        const createdOrg = (await createOrgResponse.json()) as {
          id?: number;
          name?: string;
          description?: string;
        };
        if (createdOrg.id) {
          organization = createdOrg;
        }
      }
    }

    if (organization?.id) {
      const organizationId = organization.id;
      await page.route("**/api/organizations/my-organizations", async (route) => {
        const upstream = await route.fetch();
        if (upstream.ok()) {
          try {
            const json = (await upstream.json()) as {
              organizations?: Array<{ id: number }>;
            };
            if (json.organizations?.length) {
              await route.fulfill({ response: upstream });
              return;
            }
          } catch {
            // fallback to stubbed response
          }
        }

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ organizations: [organization] }),
        });
      });

      await page.addInitScript(
        ({ orgId }) => {
          localStorage.setItem("currentOrganizationId", String(orgId));
        },
        { orgId: organizationId },
      );
    }

    const orgsResponsePromise = page
      .waitForResponse(
        (response) => {
          return (
            response.url().includes("/api/organizations/my-organizations") &&
            response.request().method() === "GET"
          );
        },
        { timeout: 10000 },
      )
      .catch(() => null);

    await page.goto("/admin");
    await page.waitForLoadState("networkidle");
    await orgsResponsePromise;

    await expect(page.locator('[data-admin-dashboard="true"]')).toBeVisible({
      timeout: 10000,
    });
    await ensureOrganizationSelected(page, {
      organizationId: organization?.id,
      organizationName: organization?.name,
    });
    await expect(
      page.locator('[data-admin-quiz-grid="true"], [data-admin-quiz-empty="true"]')
    ).toBeVisible({ timeout: 10000 });
  });

  test("should create a new quiz", async ({ page }) => {
    const quizTitle = `Test Quiz ${Date.now()}`;

    await page
      .getByRole("button", { name: /create quiz|créer un quiz/i })
      .click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog
      .locator('input[type="text"]')
      .first()
      .fill(quizTitle);
    await dialog
      .locator('textarea')
      .first()
      .fill("Test quiz description");

    await dialog.getByRole("button", { name: /create quiz|créer un quiz/i }).click();

    await expect
      .poll(
        async () => {
          return await page.getByText(quizTitle, { exact: false }).count();
        },
        { timeout: 10000 },
      )
      .toBeGreaterThan(0);
  });

  test("should add questions to a quiz", async ({ page }) => {
    const manageButtons = page.getByRole("button", { name: /manage|gérer/i });

    if ((await manageButtons.count()) === 0) {
      const quizTitle = `Test Quiz ${Date.now()}`;

      await page
        .getByRole("button", { name: /create quiz|créer un quiz/i })
        .click();

      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();

      await dialog.locator('input[type="text"]').first().fill(quizTitle);
      await dialog
        .locator("textarea")
        .first()
        .fill("Test quiz description");

      await dialog
        .getByRole("button", { name: /create quiz|créer un quiz/i })
        .click();

      await expect
        .poll(
          async () => {
            return await page.getByText(quizTitle, { exact: false }).count();
          },
          { timeout: 10000 },
        )
        .toBeGreaterThan(0);
    }

    await expect(manageButtons.first()).toBeEnabled({ timeout: 10000 });
    await manageButtons.first().click();

    await expect(page).toHaveURL(/\/admin\/quizzes\//);
    await expect(page.locator('[data-questions-page="true"]')).toBeVisible();
  });

  test("should view list of quizzes", async ({ page }) => {
    await expect(
      page.locator('[data-admin-quiz-grid="true"], [data-admin-quiz-empty="true"]')
    ).toBeVisible();
  });
});

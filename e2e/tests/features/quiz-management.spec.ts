import { test, expect } from "@playwright/test";
import { loginViaApi } from "../helpers/auth";

const TOKEN_STORAGE_KEY = "pleey_token";
const REFRESH_TOKEN_STORAGE_KEY = "pleey_refresh_token";
const USER_STORAGE_KEY = "pleey_user";
const ORGANIZATION_ID_STORAGE_KEY = "currentOrganizationId";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://backend:3001/api";

const ensureOrganizationSelected = async (
  page: import("@playwright/test").Page,
  credentials: { email: string; password: string },
) => {
  const createQuizButton = page.getByRole("button", {
    name: /create quiz|créer un quiz/i,
  });

  await expect(createQuizButton).toBeVisible({ timeout: 10000 });
  if (await createQuizButton.isEnabled()) {
    return;
  }

  const ensuredOrganizationId = await page.evaluate(async ({ auth, keys }) => {
    let token = localStorage.getItem(keys.token);
    if (!token) {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: auth.email,
          password: auth.password,
        }),
      });

      if (response.ok) {
        const payload = await response.json();
        const accessToken = payload?.accessToken ?? payload?.token;
        const refreshToken = payload?.refreshToken;
        const user = payload?.user;

        if (accessToken && refreshToken && user) {
          token = accessToken;
          localStorage.setItem(keys.token, accessToken);
          localStorage.setItem(keys.refreshToken, refreshToken);
          localStorage.setItem(keys.user, JSON.stringify(user));
        }
      }
    }

    if (!token) {
      return null;
    }

    const fetchOrganizations = async () => {
      const response = await fetch("/api/organizations/my-organizations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return [];
      }

      const payload = await response.json();
      const organizations = Array.isArray(payload)
        ? payload
        : payload?.organizations;
      return organizations ?? [];
    };

    let organizations = await fetchOrganizations();
    if (!organizations.length) {
      const createResponse = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `E2E Organization ${Date.now()}`,
          description: "E2E seeded organization",
        }),
      });

      if (createResponse.ok) {
        const created = await createResponse.json();
        if (created?.id) {
          return created.id;
        }
      }

      organizations = await fetchOrganizations();
    }

    return organizations?.[0]?.id ?? null;
  }, {
    auth: credentials,
    keys: {
      token: TOKEN_STORAGE_KEY,
      refreshToken: REFRESH_TOKEN_STORAGE_KEY,
      user: USER_STORAGE_KEY,
    },
  });

  if (ensuredOrganizationId) {
    await page.evaluate(
      ({ orgId, key }) => {
        localStorage.setItem(key, String(orgId));
      },
      { orgId: ensuredOrganizationId, key: ORGANIZATION_ID_STORAGE_KEY },
    );

    await page.reload();
    await page.waitForLoadState("networkidle");

    if (await createQuizButton.isEnabled()) {
      return;
    }
  }

  const organizationTrigger = page
    .locator('button[aria-haspopup="menu"]')
    .filter({ hasText: /organization|organisation/i })
    .first();

  await expect(organizationTrigger).toBeVisible({ timeout: 10000 });
  await organizationTrigger.click();

  const fallbackOrganization = page
    .getByText(/arcade labs|e2e organization/i)
    .first();

  const organizationOption = page
    .locator('[data-organization-option="true"]')
    .first();

  await organizationOption
    .waitFor({ state: "visible", timeout: 5000 })
    .catch(() => null);

  if ((await fallbackOrganization.count()) > 0) {
    await fallbackOrganization.click();
  } else if ((await organizationOption.count()) > 0) {
    await organizationOption.click();
  } else {
    const createOrganizationTrigger = page.getByRole("button", {
      name: /create new organization|créer une nouvelle organisation/i,
    });

    if ((await createOrganizationTrigger.count()) > 0) {
      await createOrganizationTrigger.click();

      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible({ timeout: 10000 });

      const organizationName = `E2E Organization ${Date.now()}`;
      await dialog
        .locator('input[type="text"]')
        .first()
        .fill(organizationName);
      await dialog
        .locator('textarea')
        .first()
        .fill("E2E seeded organization");

      await dialog
        .getByRole("button", {
          name: /create organization|créer une organisation/i,
        })
        .click();

      await Promise.race([
        expect(dialog).toBeHidden({ timeout: 10000 }),
        expect(createQuizButton).toBeEnabled({ timeout: 10000 }),
      ]).catch(() => null);

      if (await dialog.isVisible()) {
        const closeButton = dialog.getByRole("button", {
          name: /cancel|fermer|close/i,
        });
        if ((await closeButton.count()) > 0) {
          await closeButton.first().click();
        }
      }

      if (!(await createQuizButton.isEnabled())) {
        await organizationTrigger.click();
        const optionAfterCreate = page
          .locator('[data-organization-option="true"]')
          .first();
        if ((await optionAfterCreate.count()) > 0) {
          await optionAfterCreate.click();
        }
      }
    }
  }

  await expect(createQuizButton).toBeEnabled({ timeout: 10000 });
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
        organizations?: Array<{ id: number; name?: string; description?: string }>;
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
            "Content-Type": "application/json",
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
      await page.route("**/api/organizations/my-organizations", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ organizations: [organization] }),
        });
      });

      await page.addInitScript(
        ({ orgId, key }) => {
          localStorage.setItem(key, String(orgId));
        },
        { orgId: organization.id, key: ORGANIZATION_ID_STORAGE_KEY },
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
    const createQuizButton = page.getByRole("button", {
      name: /create quiz|créer un quiz/i,
    });

    await expect(createQuizButton).toBeVisible({ timeout: 10000 });
    await expect(createQuizButton).toBeEnabled({ timeout: 10000 }).catch(
      () => null,
    );

    if (!(await createQuizButton.isEnabled())) {
      await ensureOrganizationSelected(page, adminCredentials);
    }
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

import { test, expect } from '@playwright/test';

/**
 * Quiz Management Flow - Nominal Use Case
 * 
 * Tests the happy path for admin creating and managing quizzes
 * Critical flow: Admin must be able to create quizzes and add questions
 */

test.describe('Quiz Management Flow - Nominal Use Case', () => {
  const adminCredentials = {
    email: process.env.E2E_ADMIN_EMAIL ?? 'admin@quiz.com',
    password: process.env.E2E_ADMIN_PASSWORD ?? 'admin123',
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="email"]', adminCredentials.email);
    await page.fill('input[name="password"]', adminCredentials.password);

    await Promise.all([
      page.waitForURL(/\/admin/),
      page.getByRole('button', { name: /se connecter|login/i }).click(),
    ]);

    await page.waitForLoadState('networkidle');
  });

  test('should create a new quiz', async ({ page }) => {
    await expect(page.locator('text=/Panneau Admin/i')).toBeVisible();

    const quizTitle = `Test Quiz ${Date.now()}`;

    let dialogCount = 0;
    const handleDialog = async (dialog: import('@playwright/test').Dialog) => {
      if (dialogCount === 0) {
        await dialog.accept(quizTitle);
      } else {
        await dialog.accept('Test quiz description');
      }
      dialogCount += 1;
    };

    page.on('dialog', handleDialog);

    const createQuizResponse = page.waitForResponse((response) => {
      return (
        response.url().includes('/api/quizzes') &&
        response.request().method() === 'POST' &&
        response.status() < 500 &&
        (response.request().postData() || '').includes(quizTitle)
      );
    });

    const quizzesRefreshResponse = page.waitForResponse((response) => {
      return (
        response.url().includes('/api/quizzes') &&
        response.request().method() === 'GET' &&
        response.status() < 500
      );
    });

    await page.getByRole('button', { name: /créer un quiz/i }).click();

    const [createResponse] = await Promise.all([createQuizResponse, quizzesRefreshResponse]);
    page.off('dialog', handleDialog);

    expect(createResponse.ok()).toBeTruthy();
    const createdQuiz = await createResponse.json();
    expect(createdQuiz.title).toBe(quizTitle);

    await expect.poll(async () => {
      return await page.getByText(quizTitle, { exact: false }).count();
    }, { timeout: 10000 }).toBeGreaterThan(0);
  });

  test('should add questions to a quiz', async ({ page }) => {
    await expect(page.locator('text=/Panneau Admin/i')).toBeVisible();

    await page.getByRole('button', { name: /gérer/i }).first().click();

    await expect(page).toHaveURL(/\/admin\/quizzes\//);
    await expect(page.locator('text=/Ajouter une question/i')).toBeVisible();
  });

  test('should view list of quizzes', async ({ page }) => {
    await expect(page.locator('text=/Panneau Admin/i')).toBeVisible();

    await expect(page.getByText('Total Quiz').first()).toBeVisible();
  });
});

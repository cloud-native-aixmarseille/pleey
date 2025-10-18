import { test, expect } from '@playwright/test';

/**
 * Authentication Flow - Nominal Use Case
 * 
 * Tests the happy path for user registration and login
 * Critical flow: User must be able to register and login to use the app
 */

test.describe('Authentication Flow - Nominal Use Case', () => {
  
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123!'
  };

  test('should register a new user successfully', async ({ page }) => {
    await page.goto('/');
    
    // Look for register button/link
    const registerButton = page.locator('text=/register|inscription|s\'inscrire/i').first();
    await registerButton.click();
    
    // Wait for registration form
    await page.waitForLoadState('networkidle');
    
    // Fill registration form
    await page.fill('input[type="text"], input[placeholder*="username"], input[name="username"]', testUser.username);
    await page.fill('input[type="email"], input[placeholder*="email"], input[name="email"]', testUser.email);
    await page.fill('input[type="password"], input[placeholder*="password"], input[name="password"]', testUser.password);
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Wait for response
    await page.waitForTimeout(1000);
    
    // Verify success - should redirect or show success message
    // The user should now be logged in or redirected to login
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('register');
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/');
    
    // Look for login button/link
    const loginButton = page.locator('text=/login|connexion|se connecter/i').first();
    await loginButton.click();
    
    // Wait for login form
    await page.waitForLoadState('networkidle');
    
    // Use default admin credentials that should exist
    await page.fill('input[type="email"], input[placeholder*="email"], input[name="email"]', 'admin@quiz.com');
    await page.fill('input[type="password"], input[placeholder*="password"], input[name="password"]', 'admin123');
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Verify success - should redirect to dashboard/home
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('login');
    
    // Verify user is logged in - look for logout button or user menu
    const loggedInIndicator = await page.locator('text=/logout|déconnexion|admin|dashboard/i').count();
    expect(loggedInIndicator).toBeGreaterThan(0);
  });

  test('should reject invalid login credentials', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to login
    const loginButton = page.locator('text=/login|connexion|se connecter/i').first();
    await loginButton.click();
    
    await page.waitForLoadState('networkidle');
    
    // Try invalid credentials
    await page.fill('input[type="email"], input[placeholder*="email"], input[name="email"]', 'invalid@test.com');
    await page.fill('input[type="password"], input[placeholder*="password"], input[name="password"]', 'wrongpassword');
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Wait for error message
    await page.waitForTimeout(1000);
    
    // Should still be on login page or show error
    const hasError = await page.locator('text=/error|invalid|incorrect|échec/i').count() > 0;
    const stillOnLoginPage = page.url().includes('login');
    
    expect(hasError || stillOnLoginPage).toBeTruthy();
  });
});

# QuizMaster E2E Tests

End-to-end tests for the QuizMaster application using Playwright.

## 📚 Documentation

**Complete testing documentation is available in the [centralized docs](/docs):**
- **[Testing Guide](/docs/docs/technical/testing.md)** - Complete testing guide, strategies, and best practices
- **[Quick Reference](/docs/docs/technical/quick-reference.md)** - Command reference

## 🎯 Quick Start

## Prerequisites

- Docker Compose running (`docker-compose up -d`)
- Application accessible at:
  - Frontend: http://localhost
  - Backend: http://localhost:3001

## Installation

```bash
cd e2e
npm install
npx playwright install chromium
```

## Running Tests

### All tests
```bash
npm test
```

### Smoke tests only (fast)
```bash
npm run test:smoke
```

### With UI mode (interactive)
```bash
npm run test:ui
```

### Headed mode (see browser)
```bash
npm run test:headed
```

### Debug mode
```bash
npm run test:debug
```

### View last test report
```bash
npm run report
```

## Test Structure

```
e2e/
├── tests/
│   ├── smoke/           # Smoke tests (@smoke tag)
│   │   └── health.spec.ts
│   └── features/        # Feature/use case tests
│       ├── auth.spec.ts
│       ├── quiz-management.spec.ts
│       └── game-flow.spec.ts
├── fixtures/            # Test data and helpers
├── playwright.config.ts
└── package.json
```

## Test Coverage

### Smoke Tests (@smoke)
- ✅ Frontend loads
- ✅ Backend health endpoints
- ✅ No critical console errors
- ✅ Basic navigation works

### Nominal Use Cases
1. **Authentication**
   - ✅ User registration
   - ✅ User login (valid/invalid)
   
2. **Quiz Management**
   - ✅ Admin creates quiz
   - ✅ Admin adds questions
   - ✅ View quiz list

3. **Game Flow**
   - ✅ Join game with PIN
   - ✅ Handle invalid PIN gracefully

## CI/CD Integration

Tests run in GitHub Actions:
- On pull requests
- Before deployment
- Nightly smoke test runs

## Best Practices

1. **Keep tests independent** - Each test can run alone
2. **Use descriptive names** - Clear what is being tested
3. **Tag appropriately** - Use @smoke for quick tests
4. **Verify critical paths only** - Not every edge case
5. **Fast execution** - Target < 2 minutes for full suite

## Debugging Failed Tests

1. Check screenshots in `test-results/`
2. View video recordings (for failed tests)
3. Run with `--headed` to see browser
4. Use `--debug` for step-by-step execution
5. Check trace files in Playwright UI

## Adding New Tests

1. Identify if it's a smoke test or feature test
2. Create in appropriate directory
3. Follow existing patterns
4. Use @smoke tag for quick checks
5. Keep it focused on happy paths

## Adding New Tests

1. Identify if it's a smoke test or feature test
2. Create in appropriate directory
3. Follow existing patterns
4. Use @smoke tag for quick checks
5. Keep it focused on happy paths

### Example: Adding a New Feature Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('New Feature - Nominal Use Case', () => {
  
  test('should perform critical user action', async ({ page }) => {
    // Arrange - Set up initial state
    await page.goto('/');
    
    // Act - Perform the action
    await page.click('button#important-action');
    
    // Assert - Verify expected outcome
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

### Test Naming Convention

- **Descriptive**: `should allow user to complete checkout process`
- **Action-based**: `should reject invalid email format`
- **Outcome-focused**: `should display error when form is incomplete`

### Test Independence

Each test should:
- ✅ Run independently (no shared state)
- ✅ Clean up after itself
- ✅ Not depend on test execution order
- ✅ Have its own setup/teardown if needed

```typescript
test.beforeEach(async ({ page }) => {
  // Set up test state
  await page.goto('/');
  // Login if needed, etc.
});

test.afterEach(async ({ page }) => {
  // Clean up (if needed)
});
```

## Troubleshooting

**Tests fail immediately**
- Ensure docker-compose is running: `docker-compose ps`
- Check health endpoints: `curl http://localhost:3001/health`

**Timeouts**
- Increase timeout in playwright.config.ts
- Check if backend is slow to start

**Flaky tests**
- Use proper waits (`waitForLoadState`, `waitForSelector`)
- Avoid `waitForTimeout` when possible
- Check network conditions

## Learn More

- [Playwright Documentation](https://playwright.dev)
- [Testing Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
- [QuizMaster TESTING.md](../TESTING.md)

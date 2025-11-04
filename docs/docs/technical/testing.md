---
sidebar_position: 4
---

# Testing Guide - QuizMaster

This document explains how to run and develop tests for the QuizMaster application.

## Testing Pyramid

QuizMaster follows the **testing pyramid** principle:

```
       /  \  E2E Tests (few) - Smoke tests & critical flows
    /  INT   \ Integration Tests (some) - Component interactions
 /     UNIT     \ Unit Tests (many) - Business logic
```

- **Unit Tests** (many): Business logic, isolated components
- **Integration Tests** (some): Component interactions
- **E2E Tests** (few): Critical user flows and smoke tests

## Test Structure

```
quiz-app/
├── backend/
│   ├── src/
│   │   ├── **/*.spec.ts    # Unit tests alongside source
│   │   └── domain/         # Domain unit tests (*.spec.ts)
│   ├── test/
│   │   └── app.e2e-spec.ts # Backend E2E tests
│   ├── vitest.config.ts    # Vitest configuration
│
├── frontend/
│   ├── src/
│   │   ├── __tests__/      # React component tests
│   │   │   └── **/__tests__/ # Service tests
│   │       └── **/__tests__/ # Feature tests
│   ├── vitest.config.js    # Vitest configuration
│
└── e2e/                    # End-to-End Tests (Playwright)
    ├── tests/
    │   ├── smoke/          # Critical smoke tests
    │   ├── features/       # Feature flows
    │   └── admin/          # Admin scenarios
    ├── playwright.config.ts
    └── package.json
```

## Running Tests

### Quick Test Commands

```bash
# Run ALL tests (backend + frontend + E2E)
./test.sh

# Backend tests only
cd backend && npm test

# Frontend tests only  
cd frontend && npm test

# E2E tests only
./test-e2e.sh

# Watch mode (development)
cd backend && npm run test:watch
cd frontend && npm run test:watch
```

### Backend Tests (Vitest)

```bash
cd backend

# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# Run specific test file
npm test src/domain/user/user.service.spec.ts

# Run tests matching pattern
npm test -- user
```

**Test Files**:
- Unit tests: `src/**/*.spec.ts`
- E2E tests: `test/**/*.e2e-spec.ts`

### Frontend Tests (Vitest + React Testing Library)

```bash
cd frontend

# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# UI mode (interactive)
npm run test:ui
```

**Test Files**:
- Component tests: `src/**/__tests__/**/*.test.tsx`
- Hook tests: `src/**/__tests__/**/*.test.ts`
- Integration tests: `src/**/__tests__/**/*.integration.test.tsx`

### E2E Tests (Playwright)

```bash
# Run all E2E tests
./test-e2e.sh

# Or manually:
cd e2e
npm install
npx playwright test

# Run specific test
npx playwright test tests/smoke/homepage.spec.ts

# Debug mode
npx playwright test --debug

# UI mode
npx playwright test --ui

# Run specific browser
npx playwright test --project=chromium

# Headed mode (see browser)
npx playwright test --headed
```

## Writing Tests

### Backend Unit Tests (Vitest)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { UserService } from './user.service';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  it('should create a user', async () => {
    const user = await userService.create({
      username: 'testuser',
      email: 'test@example.com'
    });

    expect(user).toBeDefined();
    expect(user.username).toBe('testuser');
  });

  it('should validate email format', () => {
    expect(() => {
      userService.validateEmail('invalid');
    }).toThrow('Invalid email');
  });
});
```

### Frontend Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QuizCard } from './QuizCard';

describe('QuizCard', () => {
  it('should render quiz title', () => {
    render(<QuizCard title="My Quiz" />);
    expect(screen.getByText('My Quiz')).toBeInTheDocument();
  });

  it('should call onStart when clicked', () => {
    const onStart = vi.fn();
    render(<QuizCard title="Quiz" onStart={onStart} />);
    
    fireEvent.click(screen.getByText('Start'));
    expect(onStart).toHaveBeenCalled();
  });
});
```

### E2E Tests (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Quiz Flow', () => {
  test('should create and start quiz', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@quiz.com');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Create quiz
    await page.click('text=Create Quiz');
    await page.fill('[name="title"]', 'Test Quiz');
    await page.click('text=Save');

    // Verify quiz created
    await expect(page.locator('text=Test Quiz')).toBeVisible();
  });
});
```

## Test Configuration

### Vitest Configuration (Backend)

```typescript
// backend/vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

### Vitest Configuration (Frontend)

```typescript
// frontend/vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

### Playwright Configuration

```typescript
// e2e/playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 2,
  use: {
    baseURL: 'http://localhost',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
  ],
});
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Backend Tests
        run: |
          cd backend
          npm install
          npm test

      - name: Frontend Tests
        run: |
          cd frontend
          npm install
          npm test

      - name: E2E Tests
        run: |
          docker-compose up -d
          ./test-e2e.sh
```

## Test Coverage

### Coverage Goals

- **Unit Tests**: 80% coverage minimum
- **Integration Tests**: Critical paths covered
- **E2E Tests**: Smoke tests + critical user flows

### View Coverage

```bash
# Backend
cd backend && npm run test:cov
# Open: backend/coverage/index.html

# Frontend
cd frontend && npm run test:coverage
# Open: frontend/coverage/index.html
```

## Best Practices

### Unit Tests
- ✅ Test one thing at a time
- ✅ Use descriptive test names
- ✅ Follow AAA pattern (Arrange, Act, Assert)
- ✅ Mock external dependencies
- ✅ Test edge cases and errors

### Integration Tests
- ✅ Test real component interactions
- ✅ Use minimal mocking
- ✅ Test API integration
- ✅ Verify database interactions

### E2E Tests
- ✅ Test critical user journeys
- ✅ Use page object pattern
- ✅ Test across browsers
- ✅ Keep tests independent
- ✅ Use meaningful assertions

## Troubleshooting

### Tests Fail Locally

```bash
# Clear cache
rm -rf node_modules .vite
npm install

# Reset database
docker-compose down -v
docker-compose up -d
```

### E2E Tests Timeout

```bash
# Increase timeout in playwright.config.ts
timeout: 60000, // 60 seconds

# Or specific test
test('slow test', async ({ page }) => {
  test.setTimeout(60000);
  // ...
});
```

### Flaky Tests

- Use `test.retry(2)` for specific tests
- Add explicit waits: `await page.waitForSelector()`
- Use `toBeVisible()` instead of `toBeTruthy()`

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

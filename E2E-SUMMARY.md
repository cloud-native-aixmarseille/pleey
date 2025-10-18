# E2E Tests Summary

## Overview

This document provides a quick reference for the E2E testing setup in QuizMaster.

## Quick Start

```bash
# 1. Start the application
docker compose up -d

# 2. Run all e2e tests
./test-e2e.sh

# Or run smoke tests only (faster)
./test-e2e.sh smoke
```

## Test Pyramid Philosophy

QuizMaster follows the testing pyramid:

```
     /\      E2E (16 tests)      - Smoke tests + critical flows
    /  \     ───────────────
   /────\    Integration         - Component interactions  
  /      \   
 /  Unit  \  (103+ tests)        - Business logic
/__________\
```

### Why This Matters

- **Unit tests**: Fast, many, test individual functions
- **E2E tests**: Slow, few, test complete user journeys
- **Balance**: More unit tests, fewer e2e tests = fast, reliable test suite

## Test Categories

### 1. Smoke Tests (@smoke) - 7 tests

**Purpose**: Quick sanity checks that the application is running

**Tests**:
- Frontend loads
- Backend health endpoints (/health, /health/live, /health/ready)
- Login/register UI visible
- Navigation works
- No critical console errors

**Run time**: ~30 seconds

**Usage**: Run before detailed tests, in CI pipelines, after deployments

```bash
cd e2e && npm run test:smoke
```

### 2. Nominal Use Cases - 9 tests

**Purpose**: Test critical user flows (happy path only)

**Tests**:

#### Authentication (3 tests)
- User registration
- Valid login
- Invalid login rejected

#### Quiz Management (3 tests)
- Admin creates quiz
- Admin adds questions
- View quiz list

#### Game Flow (3 tests)
- Join game with PIN
- Lobby display
- Invalid PIN handled

**Run time**: ~2 minutes

**Usage**: Before deployments, in CI on PRs

```bash
cd e2e && npm test
```

## CI/CD Integration

E2E tests run automatically in GitHub Actions:

```yaml
Workflow:
1. Run unit tests (backend + frontend)
2. Build Docker images
3. Start services
4. Run smoke tests (fail-fast)
5. Run all e2e tests
6. Publish on success
```

**Artifacts**:
- Test reports (30 days)
- Screenshots on failure
- Videos on failure
- Test results (7 days)

## Test Structure

```
e2e/
├── tests/
│   ├── smoke/
│   │   └── health.spec.ts          # Smoke tests (@smoke tag)
│   └── features/
│       ├── auth.spec.ts            # Authentication flow
│       ├── quiz-management.spec.ts # Quiz CRUD
│       └── game-flow.spec.ts       # Join & play
├── fixtures/                       # Test data (future)
├── playwright.config.ts            # Playwright config
├── package.json                    # Dependencies & scripts
└── README.md                       # Detailed docs
```

## Running Tests Locally

### Prerequisites
```bash
# 1. Application must be running
docker compose up -d

# 2. Install dependencies (first time only)
cd e2e && npm install
npx playwright install chromium
```

### Run Options

```bash
# All tests
cd e2e && npm test

# Smoke tests only
cd e2e && npm run test:smoke

# Interactive UI mode
cd e2e && npm run test:ui

# Debug mode (step-through)
cd e2e && npm run test:debug

# See browser (headed mode)
cd e2e && npm run test:headed

# View last report
cd e2e && npm run report
```

### Using the Helper Script

```bash
# From project root
./test-e2e.sh          # All tests
./test-e2e.sh smoke    # Smoke only
./test-e2e.sh ui       # Interactive UI
./test-e2e.sh debug    # Debug mode
```

The script automatically:
- Checks Docker is running
- Starts services if needed
- Waits for health checks
- Runs tests
- Shows results

## Debugging Failed Tests

### 1. Check Test Results
```bash
cd e2e
npm run report  # Opens HTML report
```

### 2. View Screenshots
```bash
ls e2e/test-results/*/test-failed-*.png
```

### 3. Watch Test Video
```bash
ls e2e/test-results/*/video.webm
open e2e/test-results/*/video.webm
```

### 4. View Traces
```bash
cd e2e
npx playwright show-trace test-results/*/trace.zip
```

### 5. Run in Debug Mode
```bash
cd e2e
npm run test:debug
```

## Common Issues

### Tests Fail Immediately

**Problem**: Application not running

**Solution**:
```bash
docker compose ps  # Check status
docker compose up -d  # Start services
curl http://localhost:3001/health  # Verify backend
curl http://localhost  # Verify frontend
```

### Timeout Errors

**Problem**: Services slow to start

**Solution**:
```bash
# Increase timeout in playwright.config.ts
timeout: 60 * 1000  # 60 seconds instead of 30
```

### Flaky Tests

**Problem**: Tests pass/fail randomly

**Solution**:
- Check network conditions
- Verify proper waits (avoid `waitForTimeout`)
- Use `waitForLoadState('networkidle')`
- Check for race conditions

### Browser Installation Issues

**Problem**: Playwright can't download browsers

**Solution**:
```bash
cd e2e
npx playwright install --with-deps chromium
```

## Best Practices

### ✅ DO

- Keep tests independent (no shared state)
- Use descriptive test names
- Tag smoke tests with @smoke
- Test happy paths only (nominal use cases)
- Use proper waits (`waitForSelector`, `waitForLoadState`)
- Add tests for critical user flows only

### ❌ DON'T

- Test every edge case (use unit tests)
- Add unnecessary e2e tests (slow & expensive)
- Use `waitForTimeout` (flaky)
- Share state between tests
- Test implementation details
- Forget to clean up test data

## Adding New Tests

### 1. Identify Test Type

**Is it a smoke test?**
- Quick check (<5s)
- Basic availability
- No complex interactions
→ Add to `tests/smoke/`

**Is it a critical user flow?**
- Complete user journey
- Happy path only
- Core functionality
→ Add to `tests/features/`

### 2. Create Test File

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something important', async ({ page }) => {
    // Arrange
    await page.goto('/');
    
    // Act
    await page.click('button');
    
    // Assert
    await expect(page.locator('h1')).toHaveText('Success');
  });
});
```

### 3. Tag Appropriately

```typescript
test('should load quickly @smoke', async ({ page }) => {
  // Test code
});
```

### 4. Run and Verify

```bash
cd e2e
npm run test:debug  # Debug new test
npm test  # Run all tests
```

## Metrics

### Current Coverage

- **Total E2E tests**: 16
- **Smoke tests**: 7 (44%)
- **Feature tests**: 9 (56%)
- **Estimated run time**: ~2-3 minutes
- **CI/CD integration**: ✅ Yes
- **Browser coverage**: Chromium (expandable to Firefox, Safari)

### Test Distribution

```
Smoke Tests (7):
├── Frontend load
├── Backend /health
├── Backend /health/live  
├── Backend /health/ready
├── Login/register UI
├── Navigation
└── Console errors

Feature Tests (9):
├── Authentication (3)
│   ├── Registration
│   ├── Valid login
│   └── Invalid login
├── Quiz Management (3)
│   ├── Create quiz
│   ├── Add questions
│   └── View list
└── Game Flow (3)
    ├── Join with PIN
    ├── Lobby display
    └── Invalid PIN
```

## Future Enhancements

### Potential Additions

- [ ] Cross-browser testing (Firefox, Safari)
- [ ] Mobile viewport testing
- [ ] Performance testing (Lighthouse)
- [ ] Accessibility testing (axe-core)
- [ ] Visual regression testing
- [ ] API contract testing
- [ ] Load testing integration

### Test Data Management

- [ ] Test fixtures for quiz data
- [ ] Seed database for tests
- [ ] Cleanup strategies
- [ ] Test user management

## Resources

- [E2E README](e2e/README.md) - Detailed documentation
- [TESTING.md](TESTING.md) - Complete test guide
- [Playwright Docs](https://playwright.dev)
- [Testing Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)

## Contact

For questions or issues with E2E tests:
1. Check this document first
2. Read [e2e/README.md](e2e/README.md)
3. Check [TESTING.md](TESTING.md)
4. Open an issue on GitHub

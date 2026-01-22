# 🤝 Contributing Guide - Pleey

Thank you for your interest in contributing to Pleey! This guide will help you get started.

## 📚 Complete Documentation

**Detailed documentation is available in `/docs`.**

For complete guides:

- **[Testing](docs/docs/technical/testing.md)** - Complete testing guide
- **[Architecture](docs/docs/technical/architecture/index.md)** - System architecture
- **[Design System](docs/docs/technical/design-system.md)** - Cyber Arcade design system
- **[Docker](docs/docs/technical/docker-guide.md)** - Docker guide
- **[Security](docs/docs/technical/security.md)** - Security
- **[Documentation Guide](docs/docs/technical/documentation-guide.md)** - How to write and maintain docs

## 🤝 Code of Conduct

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards other community members

## 🎯 Types of Contributions

1. **Bugfixes** 🐛
2. **New Features** ✨
3. **Documentation** 📚 - See [Documentation Guide](docs/docs/technical/documentation-guide.md)
4. **Tests** 🧪
5. **Optimizations** ⚡
6. **Translations** 🌍

## 🛠️ Environment Setup

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git
- Code editor (Visual Studio Code recommended)

### Quick Installation

```bash
# 1. Fork the project on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/quiz-app.git
cd quiz-app

# 3. Install with Docker (recommended)
make install
make up

# 4. Create a branch for your contribution
git checkout -b feature/my-new-feature
```

📘 **For more details**: See [Docker Guide](docs/docs/technical/docker-guide.md)

## 📝 Code Standards

### Development Principles

- **SOLID Principles**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **DRY**: Don't Repeat Yourself
- **KISS**: Keep It Simple
- **Clean Code**: Readable and maintainable code
- **Clean Architecture**: Separation of concerns
- **Conventional Commits**: Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification
- **Semantic Versioning**: Follow [Semantic Versioning 2.0.0](https://semver.org/)
- **Accessibility First**: WCAG 2.1 AA compliance is mandatory for all UI changes

### Internationalization & Error Handling

- **All user-facing text must use translations**: never hardcode strings—add keys to both `en` and `fr` locales in frontend (`application/frontend/src/i18n/locales/`) and backend (`application/backend/src/i18n/`).
- **Error messages come from enums**: define domain-specific error enums and map each enum value to a translation key; surface the translated message when returning or displaying errors.
- **Code reviews enforce coverage**: pull requests get blocked if translations or enum mappings are missing for any new text or error.

### Frontend Logging

- **`console.*` is forbidden in committed frontend code** (components, hooks, use cases, repositories).
- Prefer translated UI notifications, domain-specific error flows, or telemetry utilities to surface issues.
- Limit console stubbing to test helpers when intercepting React warnings/errors.

### Conventional Commits

All commit messages must follow the Conventional Commits specification:

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New feature
- `fix`: bugfix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: build tool changes

**Examples:**

```text
feat(quiz): add timer pause functionality
fix(auth): resolve JWT token expiration issue
docs(readme): update installation instructions
style(button): fix linting errors
refactor(game): simplify score calculation logic
test(quiz): add unit tests for quiz service
chore(deps): update dependencies
```

### Semantic Versioning

This project follows [Semantic Versioning 2.0.0](https://semver.org/):

- **MAJOR** version: Incompatible API changes
- **MINOR** version: Backward-compatible functionality additions
- **PATCH** version: Backward-compatible bugfixes

Format: `MAJOR.MINOR.PATCH` (e.g., 1.2.3)

### Accessibility Standards

**Accessibility is non-negotiable.** All contributions must:

- ✅ Meet WCAG 2.1 Level AA standards (minimum)
- ✅ Support keyboard navigation
- ✅ Include proper ARIA labels and roles
- ✅ Maintain sufficient color contrast ratios
- ✅ Provide text alternatives for non-text content
- ✅ Be tested with screen readers
- ✅ Follow the guidelines in [Accessibility Documentation](docs/docs/technical/accessibility.md)

**Before submitting a PR with UI changes:**

1. Run accessibility audits (axe DevTools, Lighthouse)
2. Test keyboard navigation
3. Verify color contrast ratios
4. Test with a screen reader (NVDA, JAWS, or VoiceOver)
5. Document any accessibility considerations

### Architecture

- **Backend**: NestJS with DDD (Domain-Driven Design)
- **Frontend**: React with Clean Architecture
- **Styling**: Tailwind CSS with Cyber Arcade design system

📘 **See** [Architecture](docs/docs/technical/architecture/index.md) for complete details

### Naming Conventions

```typescript
// Variables and functions: camelCase
const userName = "John";
const getUserById = (id) => {};

// Classes and React components: PascalCase
class UserService {}
const QuizCard = () => {};

// Constants: UPPER_SNAKE_CASE
const API_URL = "http://localhost:3001";
```

### Styling

**Important**: Follow the [Cyber Arcade Design System](docs/docs/technical/design-system.md)

- Use theme colors (purple/pink/cyan)
- Apply retro effects (neon glow, pixel shadows)
- Follow typography guidelines (Press Start 2P, VT323, Orbitron)

## 🧪 Testing

```bash
# Backend tests
cd application/backend && npm test

# Frontend tests
cd application/frontend && npm test

# E2E tests
./scripts/test-runner.sh e2e
```

📘 **Complete guide**: [Testing Guide](docs/docs/technical/testing.md)

## 🔄 Pull Request Process

1. **Create a branch** from `main`

   ```bash
   git checkout -b feature/feature-name
   ```

2. **Make your changes**
   - Follow code standards
   - Add tests
   - Update documentation if necessary

3. **Test locally**

   ```bash
   npm test  # Unit tests
   ./scripts/test-runner.sh e2e  # E2E tests
   ```

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: feature description"
   ```

5. **Push to your fork**

   ```bash
   git push origin feature/feature-name
   ```

6. **Create a Pull Request** on GitHub
   - Clearly describe your changes
   - Reference related issues
   - Wait for code review

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat: add new feature
fix: bug fix
docs: documentation update
style: code formatting
refactor: refactoring
test: add/modify tests
chore: miscellaneous tasks
```

## 🐛 Bug Reporting

Create a GitHub issue with:

1. **Clear title** describing the problem
2. **Detailed description** of the bug
3. **Steps to reproduce** the issue
4. **Expected behavior** vs **observed behavior**
5. **Environment** (OS, browser, Node.js version, etc.)
6. **Screenshots** if applicable

## ✨ Feature Suggestions

Create a GitHub issue with:

1. **Clear title** describing the feature
2. **Detailed description** of the proposal
3. **Concrete use cases**
4. **User benefits**
5. **Mockups** or examples if applicable

## 📚 Useful Resources

### Technical Documentation

- [Architecture](docs/docs/technical/architecture/index.md)
- [Design System](docs/docs/technical/design-system.md)
- [Testing Guide](docs/docs/technical/testing.md)
- [Docker Guide](docs/docs/technical/docker-guide.md)
- [Deployment](docs/docs/technical/deployment.md)
- [Security](docs/docs/technical/security.md)
- [Documentation Guide](docs/docs/technical/documentation-guide.md)

### For AI Agents

- [AGENTS.md](AGENTS.md) - Instructions for AI agents
- [CLAUDE.md](CLAUDE.md) - Instructions for Claude

## 🙏 Acknowledgments

Thank you for contributing to Pleey! Every contribution, no matter how small, is appreciated. 🎉

---

**Questions?** Open a GitHub issue or consult the [documentation](docs/).

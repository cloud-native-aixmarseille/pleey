# 🤝 Contributing Guide - Pleey

Thank you for your interest in contributing to Pleey! This guide will help you get started.

## 📚 Documentation as Source of Truth

**All technical details live in [`/docs`](docs/).** This file covers contribution workflow only — refer to the docs for architecture, coding standards, testing, and development practices.

| Topic                 | Reference                                                                          |
| --------------------- | ---------------------------------------------------------------------------------- |
| Architecture & layers | [docs/technical/architecture/index.md](docs/technical/architecture/index.md)       |
| Backend architecture  | [docs/technical/architecture/backend.md](docs/technical/architecture/backend.md)   |
| Frontend architecture | [docs/technical/architecture/frontend.md](docs/technical/architecture/frontend.md) |
| Development practices | [docs/technical/development/index.md](docs/technical/development/index.md)         |
| Backend development   | [docs/technical/development/backend.md](docs/technical/development/backend.md)     |
| Frontend development  | [docs/technical/development/frontend.md](docs/technical/development/frontend.md)   |

## 🤝 Code of Conduct

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards other community members

## 🎯 Types of Contributions

1. **Bugfixes** 🐛
2. **New Features** ✨
3. **Documentation** 📚
4. **Tests** 🧪
5. **Optimizations** ⚡
6. **Translations** 🌍

## 🛠️ Environment Setup

See [docs/technical/development/index.md](docs/technical/development/index.md) for prerequisites, setup, and available commands.

**Quick start for contributors:**

```bash
# 1. Fork and clone
git clone https://github.com/YOUR-USERNAME/pleey.git && cd pleey

# 2. Install and start
make install && make up

# 3. Create a branch
git checkout -b feature/my-new-feature
```

## 📝 Contribution Standards

### Code Standards

Coding standards (SOLID, Clean Code, Clean Architecture, naming conventions, error handling, i18n, dependency boundaries) are defined in [docs/technical/development/index.md](docs/technical/development/index.md).

### Semantic Versioning

This project follows [Semantic Versioning 2.0.0](https://semver.org/):

- **MAJOR**: Incompatible API changes
- **MINOR**: Backward-compatible functionality additions
- **PATCH**: Backward-compatible bugfixes

### Accessibility Standards

**Accessibility is non-negotiable.** All UI contributions must:

- Meet WCAG 2.1 Level AA standards (minimum)
- Support keyboard navigation
- Include proper ARIA labels and roles
- Maintain sufficient color contrast ratios
- Provide text alternatives for non-text content

**Before submitting a PR with UI changes:**

1. Run accessibility audits (axe DevTools, Lighthouse)
2. Test keyboard navigation
3. Verify color contrast ratios
4. Test with a screen reader (NVDA, JAWS, or VoiceOver)

## 🔄 Pull Request Process

Commit conventions and PR workflow are documented in [docs/technical/development/index.md](docs/technical/development/index.md).

**Summary:**

1. Create a branch from `main`
2. Follow code standards, add tests, update docs if needed
3. Test locally (`make test`)
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
5. Push and open a Pull Request — describe changes, reference related issues

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

## 🤖 For AI Agents

See [AGENTS.md](AGENTS.md) for AI assistant instructions.

---

**Questions?** Open a GitHub issue or consult the [documentation](docs/).

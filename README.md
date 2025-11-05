# 🎮 QuizMaster - Interactive Quiz Application

Complete interactive quiz application with real-time gameplay, scoring system, and leaderboards.

## ✨ Features

- ✅ Multiple choice and true/false questions
- 👑 Complete admin interface
- 👥 User registration and authentication
- ⚡ Points based on accuracy AND response time
- 🏆 Live leaderboards with podium
- 🎨 Cyber Arcade design system (retro synthwave aesthetic)
- 🔄 Real-time with WebSockets
- 🌍 Multi-language support (English/French)

## 🚀 Quick Start

### Installation (3 commands)

```bash
git clone <repo-url> && cd quiz-app
cp .env.example .env
make install
```

**That's it!** The application will be available at:
- Frontend: http://frontend.quiz-master.localhost
- Backend: http://backend.quiz-master.localhost
- Traefik Dashboard: http://localhost:8080

**Default admin account:**
- Email: `admin@quiz.com`
- Password: `admin123`

### Essential Commands

```bash
make install    # First-time setup (builds, starts, seeds database)
make up         # Start the application
make down       # Stop the application
make logs       # View real-time logs
make seed       # Populate database with sample data
make test       # Run all tests (backend + frontend + e2e)
make help       # See all available commands
```

> **Note**: All development is managed through `make` commands. See [Quick Reference](docs/docs/technical/quick-reference.md) for complete command list.

### Testing Commands

```bash
make test              # Run all tests (backend + frontend + e2e)
make test-backend      # Backend tests only
make test-frontend     # Frontend tests only
make test-e2e          # E2E tests only
make test-watch        # Watch mode (interactive)
make test-cov          # Coverage reports

# Or use the helper script
./scripts/test-runner.sh all           # Backend + frontend + e2e
./scripts/test-runner.sh backend       # Backend tests only
./scripts/test-runner.sh frontend --watch
./scripts/test-runner.sh e2e smoke
```

📋 **See [Testing Guide](docs/docs/technical/testing.md) for complete reference**

> 💡 Prefer the aliases above for day-to-day work. `make test` also accepts `SCOPE=<...>` and `MODE=<...>` parameters if you want a single entry point.

📘 **For more details**: See [Quick Start Guide](docs/docs/functional/quickstart.md)

## 🛠️ Tech Stack

**Backend:** NestJS + Prisma ORM + PostgreSQL + Socket.io + JWT  
**Frontend:** React 18 + Vite + Tailwind CSS + WebSockets  
**DevOps:** Docker Compose + Traefik + Nginx + Prometheus + Grafana

📘 **For complete architecture**: See [Architecture](docs/docs/technical/architecture/index.md)

## 📚 Documentation

Complete documentation is available in the `/docs` folder via Docusaurus.

### 📖 For Users
- **[Quick Start Guide](docs/docs/functional/quickstart.md)** - Installation and first steps
- **[Admin & Host Guide](docs/docs/functional/admin-host-guide.md)** - Create and host quizzes

### 🛠️ For Developers
- **[Architecture](docs/docs/technical/architecture/index.md)** - System architecture
- **[Docker Guide](docs/docs/technical/docker-guide.md)** - Docker usage
- **[Testing](docs/docs/technical/testing.md)** - Testing guide
- **[Design System](docs/docs/technical/design-system.md)** - Cyber Arcade design system
- **[Deployment](docs/docs/technical/deployment.md)** - Deployment checklist
- **[Monitoring](docs/docs/technical/monitoring.md)** - Monitoring guide
- **[Security](docs/docs/technical/security.md)** - Security policy
- **[i18n](docs/docs/technical/i18n.md)** - Internationalization
- **[Accessibility](docs/docs/technical/accessibility.md)** - Accessibility guide
- **[Quick Reference](docs/docs/technical/quick-reference.md)** - Commands and references

### 🤖 For AI Agents
- **[AGENTS.md](AGENTS.md)** - Instructions for AI agents
- **[CLAUDE.md](CLAUDE.md)** - Instructions for Claude

### 🤝 Contributing
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guide

## 📜 License

MIT

## 👨‍💻 Author

Created with ❤️ for interactive learning

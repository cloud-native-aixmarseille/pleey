# 🎮 Pleey - Community Game Platform

Community game platform with real-time experiences (quizzes and more) to energize events and animate communities.

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

```bash
git clone <repo-url> && cd pleey
make setup
```

The application will be available at:

- Frontend: `http://pleey.localhost`
- Backend API: `http://pleey.localhost/api`
- Traefik Dashboard: `http://traefik.localhost`

**Default accounts:**

| Role   | Email             | Password    |
| ------ | ----------------- | ----------- |
| Admin  | `admin@quiz.com`  | `admin123`  |
| Player | `player@quiz.com` | `player123` |

**Essential commands:** `make up`, `make down`, `make logs`, `make test`, `make help`

See [docs/technical/development/index.md](docs/technical/development/index.md) for full setup, prerequisites, and all available commands.

## 📚 Documentation

All documentation lives in [`/docs`](docs/) — the single source of truth.

### Architecture

- [Architecture Reference](docs/technical/architecture/index.md) — layers, dependency rules, ports & adapters, error strategy, tech stack
- [Backend Architecture](docs/technical/architecture/backend.md) — directory structure, use-case pattern, modules, config, testing
- [Frontend Architecture](docs/technical/architecture/frontend.md) — DI, facades, routing, GraphQL codegen, testing

### Development

- [Development Reference](docs/technical/development/index.md) — setup, commands, coding standards, commits, PR process
- [Backend Development](docs/technical/development/backend.md) — testing, use-cases, ports, resolvers, performance
- [Frontend Development](docs/technical/development/frontend.md) — codegen, lint, testing, screens, styling, DI, routing

### Contributing

- [CONTRIBUTING.md](CONTRIBUTING.md) — contribution workflow, accessibility standards, bug reporting

### For AI Agents

- [AGENTS.md](AGENTS.md) — instructions for AI assistants

## 📜 License

MIT

## 👨‍💻 Author

Created with ❤️ for interactive learning

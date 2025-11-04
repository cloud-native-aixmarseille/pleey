---
sidebar_position: 2
---

# ⚡ QuizMaster - Quick Start Guide

## 🚀 Installation (3 Commands)

```bash
# 1. Clone and enter directory
git clone <repo-url> && cd quiz-app

# 2. Copy environment variables
cp .env.example .env

# 3. Install and start everything
make install
```

**That's it!** ✨ The `make install` command will:
- Build Docker images
- Start all services (database, backend, frontend, Traefik)
- Apply database migrations
- Seed the database with sample data

## 🎮 Access the Application

:::success Application Ready
After installation, the application is immediately accessible at these URLs:
:::

- **Frontend**: http://frontend.quiz-master.localhost
- **Backend API**: http://backend.quiz-master.localhost
- **Traefik Dashboard**: http://localhost:8080

:::info Traefik Reverse Proxy
This project uses **Traefik** for domain-based routing. The `.localhost` domain automatically resolves to `127.0.0.1` (RFC 6761). No configuration needed!
:::

### Default Admin Account

- **Email**: `admin@quiz.com`
- **Password**: `admin123`

:::warning Change Password
Don't forget to change the admin password after first login!
:::

## 🎯 Create Your First Quiz

1. **Log in** as admin (admin@quiz.com / admin123)
2. **Create a quiz** - Click "New Quiz"
3. **Add questions** - Multiple choice or true/false
4. **Launch a session** - Get a PIN code
5. **Players join** - Share the PIN with participants
6. **Start the game** - Click "Start" and enjoy!

## � Essential Commands

All development tasks use `make` commands:

```bash
make install    # First-time setup (builds, starts, seeds)
make up         # Start the application
make down       # Stop the application
make restart    # Restart all services
make logs       # View real-time logs
make seed       # Repopulate database with sample data
make ps         # Check services status
make help       # See all available commands
```

:::tip Use `make help`
Run `make help` to see the complete list of available commands with descriptions.
:::

## 🔍 Verify Installation

Check that all services are running:

```bash
make ps
```

You should see 5 services running:
- `backend` (healthy)
- `frontend` (healthy)
- `postgres` (healthy)
- `traefik` (healthy)
- `otel-collector` (healthy)

## 🆘 Troubleshooting

### Services not starting?

```bash
# View logs to identify the issue
make logs

# Or check specific service
make logs-backend
make logs-frontend
```

### Need to reset everything?

```bash
# Stop and remove everything (including database)
make clean-all

# Then reinstall
make install
```

### Database needs reset?

```bash
# Reseed the database
make seed
```

## 📚 Next Steps

- **[Admin & Host Guide](admin-host-guide)** - Learn to create and manage quizzes
- **[Quick Reference](../technical/quick-reference)** - All commands and troubleshooting
- **[Docker Guide](../technical/docker-guide)** - Understand the Docker setup
- **[Architecture](../technical/architecture/index)** - Learn about the system architecture

---
sidebar_position: 2
---

# ⚡ QuizMaster - Ultra-Fast Quickstart

## 🚀 One-Line Installation

```bash
curl -fsSL https://raw.githubusercontent.com/OWNER/quiz-app/main/install.sh | bash
```

## 📋 OR Manual Installation in 3 Commands

```bash
git clone <repo-url> && cd quiz-app
cp .env.example .env && sed -i "s/your_jwt_secret/$(openssl rand -base64 32)/" .env
docker-compose up -d
```

## 🎮 Immediate Access

- **Application**: http://localhost
- **Admin**: admin@quiz.com / admin123

## 🎯 Create Your First Quiz

1. Log in as admin
2. Create a quiz
3. Add questions
4. Launch a session → get a PIN
5. Players join with the PIN
6. Start and enjoy!

## 📚 Complete Documentation

- [Documentation Home](intro) - Complete guide
- [Quick Reference](../technical/quick-reference) - All commands
- [Docker Guide](../technical/docker-guide) - Docker guide
- [Deployment Checklist](../technical/deployment) - Production deployment

## 🆘 Problem?

Check [Quick Reference](../technical/quick-reference) for common troubleshooting.

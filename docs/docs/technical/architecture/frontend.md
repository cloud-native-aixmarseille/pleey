---
sidebar_position: 2
---

# 🎨 Frontend Architecture

React 18 application with Vite, following Clean Architecture and Domain-Driven Design principles.

## 🛠️ Technologies

- **React 18**: Modern UI framework with hooks and concurrent features
- **Vite**: Fast, modern build tool (replacement for Webpack/CRA)
- **Tailwind CSS**: Utility-first CSS framework, maintainable and performant
- **Socket.io-client**: Real-time bidirectional communication
- **TypeScript**: Type-safe JavaScript

## 📁 Project Structure

```
frontend/
├── src/
│   ├── App.tsx                    # Main orchestrator
│   ├── main.jsx                   # Entry point
│   ├── index.css                  # Global styles
│   ├── ARCHITECTURE.md            # Frontend architecture documentation
│   ├── domains/                   # Domain logic (DDD)
│   │   ├── auth/                  # Authentication domain
│   │   ├── quiz/                  # Quiz management domain
│   │   └── game/                  # Game domain
│   ├── features/                  # Feature modules
│   │   ├── home/                  # Home page
│   │   ├── authentication/        # Sign in/up
│   │   ├── quiz-management/       # Quiz admin management
│   │   └── game-play/             # Gameplay (lobby, playing, leaderboard)
│   └── shared/                    # Shared infrastructure
│       ├── config/                # Configuration
│       ├── socket/                # WebSocket client
│       ├── types/                 # TypeScript types
│       └── hooks/                 # Custom React hooks
├── public/
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎯 Key Views

- **Home**: Landing page
- **Login/Register**: Authentication flows
- **Admin**: Quiz management interface
- **Manage Questions**: Question editing interface
- **Join**: Enter game PIN to join
- **Lobby**: Waiting room before game starts
- **Playing**: Live game with questions
- **Leaderboard**: Final rankings and podium

## 🔄 Data Flow

```
User Action → State Update → API Call/WebSocket → Backend
                ↓
            UI Update ← Backend Response
```

## 🏗️ Architecture Pattern

The frontend follows **Clean Architecture** and **Domain-Driven Design** (DDD):

### Domains
Core business logic organized by domain:
- **auth/**: User authentication and authorization
- **quiz/**: Quiz creation and management
- **game/**: Game session and gameplay logic

### Features
User-facing feature modules:
- Each feature encapsulates UI components, hooks, and state
- Features consume domain logic
- Features are organized by user journey

### Shared
Reusable infrastructure:
- **config/**: Environment configuration
- **socket/**: WebSocket client setup
- **types/**: Shared TypeScript interfaces
- **hooks/**: Custom React hooks

## 🎨 Design System

The application uses the **Cyber Arcade** design system. See [Design System](../design-system.md) for complete details.

## 🌍 Internationalization

Multi-language support (English/French) using i18n. See [i18n Guide](../i18n.md) for details.

## ♿ Accessibility

WCAG 2.1 AA compliance is mandatory. See [Accessibility Guide](../accessibility.md) for details.

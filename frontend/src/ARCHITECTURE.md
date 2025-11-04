# Frontend Architecture

## 📚 Documentation

**Complete documentation is available in the [centralized docs](/docs):**
- **[Architecture](/docs/docs/technical/architecture.md)** - Complete system architecture
- **[Design System](/docs/docs/technical/design-system.md)** - Cyber Arcade design system
- **[Testing](/docs/docs/technical/testing.md)** - Testing guide
- **[Accessibility](/docs/docs/technical/accessibility.md)** - Accessibility standards

## 🏗️ Quick Overview

This frontend follows **Clean Architecture**, **Screaming Architecture**, and **Domain-Driven Design** principles.

### 📁 Directory Structure

```
frontend/src/
├── App.tsx                    # Main application orchestrator
├── main.jsx                   # Application entry point
│
├── domains/                   # Business Logic Layer (DDD)
│   ├── auth/                  # Authentication domain
│   │   └── auth.service.ts   # Authentication business logic
│   ├── quiz/                  # Quiz management domain
│   │   └── quiz.service.ts   # Quiz business logic
│   └── game/                  # Game play domain
│       └── game.service.ts   # Game business logic
│
├── features/                  # Feature Modules (Screaming Architecture)
│   ├── home/                  # Home feature
│   │   └── components/
│   │       └── HomePage.tsx
│   ├── authentication/        # Authentication feature
│   │   └── components/
│   │       ├── LoginPage.tsx
│   │       └── RegisterPage.tsx
│   ├── quiz-management/       # Quiz management feature
│   │   └── components/
│   │       ├── AdminDashboard.tsx
│   │       └── ManageQuestionsPage.tsx
│   └── game-play/             # Game play feature
│       └── components/
│           ├── JoinGamePage.tsx
│           ├── LobbyPage.tsx
│           ├── PlayingPage.tsx
│           └── LeaderboardPage.tsx
│
└── shared/                    # Shared Infrastructure
    ├── config/                # Configuration
    │   └── api.config.ts
    ├── socket/                # WebSocket client
    │   └── socket.client.ts
    ├── types/                 # TypeScript definitions
    │   └── index.ts
    └── hooks/                 # Custom React hooks
        ├── useGameSocket.ts
        └── useTimer.ts
```

### 🎯 Architecture Principles Applied

#### 1. **Screaming Architecture**
The directory structure "screams" what the application does:
- `domains/auth/` - Clear authentication domain
- `domains/quiz/` - Clear quiz management
- `domains/game/` - Clear game functionality
- `features/` - User-facing features are explicit

#### 2. **Clean Architecture (Layers)**
- **Domain Layer**: `domains/` - Business logic, independent of frameworks
- **Application Layer**: `features/` - Use cases and UI components
- **Infrastructure Layer**: `shared/` - External concerns (API, sockets, config)
- **Presentation Layer**: Components in `features/*/components/`

#### 3. **Domain-Driven Design (DDD)**
- **Bounded Contexts**: Auth, Quiz, Game are separate domains
- **Services**: Each domain has its service class
- **Entities**: Defined in `shared/types/`
- **Separation of Concerns**: Each domain is independent

### 🔄 Data Flow

```
User Action → Component → Domain Service → API/Socket → Backend
                ↓              ↓
             State ←――――― Response
                ↓
            UI Update
```

### 🎨 Component Organization

Each feature follows this pattern:
```
features/[feature-name]/
├── components/          # UI components
│   └── [Feature]Page.tsx
└── hooks/              # Feature-specific hooks (if needed)
```

### 🔌 Dependency Rule

Dependencies point inward:
- `features/` depends on `domains/` and `shared/`
- `domains/` depends only on `shared/types/`
- `shared/` has no internal dependencies
- **Inner layers never depend on outer layers**

### 📝 Key Files

- **App.tsx**: Main orchestrator, handles routing and state management
- **Domain Services**: Encapsulate business logic (auth, quiz, game)
- **Feature Components**: Pure presentation components
- **Shared Hooks**: Reusable React hooks (socket, timer)

### ✅ Benefits

1. **Testability**: Each layer can be tested independently
2. **Maintainability**: Clear separation of concerns
3. **Scalability**: Easy to add new features or domains
4. **Understanding**: Structure explains the application's purpose
5. **Flexibility**: Easy to replace infrastructure (API, database)

### 🚀 Adding New Features

1. Create domain service in `domains/[domain]/`
2. Create feature folder in `features/[feature]/`
3. Create components in `features/[feature]/components/`
4. Wire up in `App.tsx`
5. Add types in `shared/types/` if needed

### 🔧 Migration Notes

This refactoring maintains 100% functional compatibility with the previous monolithic structure while providing better organization for future development.

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

## 🔎 Logging & Debugging

- **Never commit `console.*` calls** in frontend code (components, hooks, use cases, repositories).
- Surface recoverable issues through translated UI feedback or dedicated error handling utilities instead of console logs.
- Capture unexpected failures with telemetry/reporting services rather than `console` (stub only in tests when spying on React warnings).
- Use browser devtools or `vitest` debugging locally, then remove temporary logging before opening a pull request.

## 🗂️ Project Structure

```
frontend/
├── src/
│   ├── App.tsx                    # Main app with context providers
│   ├── AppRoutes.tsx              # Routing configuration
│   ├── main.jsx                   # Entry point
│   ├── index.css                  # Global styles
│   ├── application/               # Application Layer (Use Cases)
│   │   ├── auth/
│   │   │   └── use-cases/
│   │   │       ├── login.use-case.ts
│   │   │       ├── register.use-case.ts
│   │   │       ├── logout.use-case.ts
│   │   │       └── restore-session.use-case.ts
│   │   ├── quiz/
│   │   │   └── use-cases/
│   │   │       ├── get-quizzes.use-case.ts
│   │   │       ├── create-quiz.use-case.ts
│   │   │       └── add-question.use-case.ts
│   │   └── game/
│   │       └── use-cases/
│   │           ├── launch-quiz.use-case.ts
│   │           ├── join-game.use-case.ts
│   │           └── submit-answer.use-case.ts
│   ├── domains/                   # Domain Layer
│   │   ├── auth/
│   │   │   ├── ports/             # Interfaces (Dependency Inversion)
│   │   │   │   └── auth.repository.interface.ts
│   │   │   └── infrastructure/    # Implementations
│   │   │       └── auth-http.repository.ts
│   │   ├── quiz/
│   │   │   ├── ports/
│   │   │   │   └── quiz.repository.interface.ts
│   │   │   └── infrastructure/
│   │   │       └── quiz-http.repository.ts
│   │   └── game/
│   │       ├── ports/
│   │       │   ├── game.repository.interface.ts
│   │       │   └── game-socket.interface.ts
│   │       └── infrastructure/
│   │           ├── game-http.repository.ts
│   │           └── game-socket.adapter.ts
│   ├── features/                  # Presentation Layer
│   │   ├── home/
│   │   ├── authentication/
│   │   ├── quiz-management/
│   │   └── game-play/
│   │       ├── components/
│   │       └── routes/            # Route components
│   └── shared/                    # Infrastructure Layer
│       ├── di/                    # Dependency Injection
│       │   └── container.ts
│       ├── context/               # React Context (State Management)
│       │   ├── AuthContext.tsx
│       │   ├── QuizContext.tsx
│       │   └── GameContext.tsx
│       ├── ports/                 # Shared interfaces
│       │   └── storage.interface.ts
│       ├── infrastructure/
│       │   └── local-storage.adapter.ts
│       ├── config/
│       ├── socket/
│       ├── types/
│       ├── hooks/
│       └── components/
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
User Action → Context Hook → Use Case → Repository → API/WebSocket
                    ↓
            State Update ← Backend Response ← Repository ← Use Case
                    ↓
               UI Update
```

## 🏗️ Clean Architecture Layers

The frontend follows **Clean Architecture** principles with strict layer separation:

### 1. Domain Layer (`domains/`)
**Core business entities and interfaces**

- Defines **ports** (interfaces) following **Dependency Inversion Principle**
- **Zero dependencies** on UI frameworks
- Contains repository interfaces and domain contracts
- **Pure TypeScript** with no React dependencies

Example:
```typescript
// domains/auth/ports/auth.repository.interface.ts
export interface IAuthRepository {
  login(email: string, password: string): Promise<{ token: string; user: User }>;
  register(username: string, email: string, password: string): Promise<void>;
}
```

### 2. Application Layer (`application/`)
**Use cases and business logic**

- Implements **business logic** independent of UI
- Orchestrates domain objects and repositories
- Each use case has **single responsibility**
- **Testable in isolation** with mocked dependencies

Example:
```typescript
// application/auth/use-cases/login.use-case.ts
export class LoginUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly storage: IStorage
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    const { token, user } = await this.authRepository.login(request.email, request.password);
    this.storage.setItem('token', token);
    this.storage.setItem('user', JSON.stringify(user));
    return { token, user };
  }
}
```

### 3. Infrastructure Layer (`domains/*/infrastructure/`, `shared/infrastructure/`)
**External adapters and implementations**

- Implements domain interfaces (repositories, adapters)
- Handles **HTTP calls**, **WebSockets**, **localStorage**
- Depends on domain layer (implements interfaces)
- **Easily replaceable** (e.g., mock for testing)

Example:
```typescript
// domains/auth/infrastructure/auth-http.repository.ts
export class AuthHttpRepository implements IAuthRepository {
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }
}
```

### 4. Presentation Layer (`features/`)
**UI components and React-specific code**

- Consumes use cases via **React Context**
- Handles **user interactions** and **UI state**
- **No business logic** - delegates to use cases
- Uses **Cyber Arcade design system**

Example:
```typescript
// features/authentication/components/LoginPage.tsx
export default function LoginPage() {
  const { login } = useAuth(); // From context
  
  const handleSubmit = async (email, password) => {
    await login(email, password);
  };
}
```

### 5. Dependency Injection (`shared/di/`)
**Wiring and configuration**

- **Single source of truth** for dependencies
- Implements **Inversion of Control**
- Makes testing easy with mock injection
- Follows **Dependency Injection Pattern**

Example:
```typescript
// shared/di/container.ts
export class DependencyContainer {
  private readonly authRepository = new AuthHttpRepository();
  private readonly storage = new LocalStorageAdapter();
  
  readonly loginUseCase = new LoginUseCase(this.authRepository, this.storage);
}

export const container = new DependencyContainer();
```

## 🎯 SOLID Principles

### Single Responsibility Principle (SRP)
- ✅ Each use case has **one responsibility**
- ✅ Repositories only handle **data access**
- ✅ Components only handle **presentation**
- ✅ Route components only handle **routing logic**

### Open/Closed Principle (OCP)
- ✅ Interfaces define contracts (closed for modification)
- ✅ Easy to add new implementations (open for extension)

### Liskov Substitution Principle (LSP)
- ✅ All repository implementations are **substitutable**
- ✅ Mock implementations for testing

### Interface Segregation Principle (ISP)
- ✅ Small, **focused interfaces**
- ✅ No fat interfaces forcing unused methods

### Dependency Inversion Principle (DIP)
- ✅ High-level modules depend on **abstractions** (interfaces)
- ✅ Low-level modules implement abstractions
- ✅ **Dependency injection** container manages dependencies

## 🧪 Testing Strategy

### Unit Tests (Use Cases)
```typescript
describe('LoginUseCase', () => {
  it('should login and store credentials', async () => {
    const mockRepo: IAuthRepository = { login: vi.fn().mockResolvedValue(...) };
    const mockStorage: IStorage = { setItem: vi.fn() };
    const useCase = new LoginUseCase(mockRepo, mockStorage);
    
    await useCase.execute({ email, password });
    
    expect(mockStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
  });
});
```

### Integration Tests (Repositories)
- Test HTTP communication
- Test error handling
- Test response parsing

### Component Tests (UI)
- Test user interactions
- Test rendering
- Test context integration

### E2E Tests (Playwright)
- Complete user journeys
- Cross-browser testing
- See [Testing Guide](../testing.md)

## 📊 State Management

**React Context API** for global state:

### AuthContext
- User authentication state
- Login/logout operations
- Session restoration

### QuizContext
- Quiz and question management
- CRUD operations
- Cache management

### GameContext
- Real-time game state
- WebSocket events
- Player interactions

## 🔌 WebSocket Integration

WebSocket communication via **Socket.IO**:

1. **GameSocketAdapter** implements `IGameSocket` interface
2. Wraps Socket.IO client
3. Used by game use cases
4. State updates via **GameContext**

## 🧩 Domains

### Authentication Domain (`auth/`)
- User login and registration
- JWT token management
- Session persistence

### Quiz Domain (`quiz/`)
- Quiz creation and management
- Question CRUD operations
- Quiz metadata

### Game Domain (`game/`)
- Game session management
- Real-time gameplay
- Leaderboard tracking

## 🎯 Features

### Home
Landing page with navigation

### Authentication
- Login page
- Registration page
- Password validation

### Quiz Management (Admin)
- Quiz dashboard
- Question editor
- Quiz launch

### Game Play
- Join game (PIN entry)
- Lobby (waiting room)
- Playing (live quiz)
- Leaderboard (results)

## 📚 Additional Resources

For more details, see:
- **[REFACTORING.md](../../../../frontend/REFACTORING.md)** - Detailed refactoring documentation
- **[Design System](../design-system.md)** - Cyber Arcade theme
- **[Testing Guide](../testing.md)** - Testing strategies
- **[i18n Guide](../i18n.md)** - Internationalization

## 🎨 Design System

The application uses the **Cyber Arcade** design system. See [Design System](../design-system.md) for complete details.

## 🌍 Internationalization

Multi-language support (English/French) using i18n. See [i18n Guide](../i18n.md) for details.

## ♿ Accessibility

WCAG 2.1 AA compliance is mandatory. See [Accessibility Guide](../accessibility.md) for details.

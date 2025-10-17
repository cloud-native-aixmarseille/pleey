# Backend Refactoring Documentation

## Overview

This document describes the refactored backend architecture for the QuizMaster application. The backend has been completely rebuilt using **NestJS**, **Prisma ORM**, and following **Clean Architecture**, **Domain-Driven Design (DDD)**, and **Test-Driven Development (TDD)** principles.

## Architecture Principles

### 1. Clean Architecture

The codebase is organized into distinct layers with clear dependency rules:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│    (Controllers, Gateways, DTOs)        │
└──────────────┬──────────────────────────┘
               │ depends on ↓
┌──────────────┴──────────────────────────┐
│         Application Layer                │
│    (Use Cases, Interfaces, DTOs)        │
└──────────────┬──────────────────────────┘
               │ depends on ↓
┌──────────────┴──────────────────────────┐
│           Domain Layer                   │
│  (Entities, Value Objects, Services)    │
└──────────────┬──────────────────────────┘
               │ implements ↑
┌──────────────┴──────────────────────────┐
│       Infrastructure Layer               │
│   (Prisma Repositories, Auth, Config)   │
└──────────────────────────────────────────┘
```

**Key Principles:**
- **Dependency Inversion**: All layers depend on abstractions (interfaces), not concrete implementations
- **Independence from Frameworks**: Domain logic is framework-agnostic
- **Testability**: Each layer can be tested in isolation
- **Separation of Concerns**: Each layer has a single, well-defined responsibility

### 2. Domain-Driven Design (DDD)

The domain layer contains rich business logic:

- **Entities**: Core business objects with identity (User, Quiz, Question, GameSession, Score)
- **Value Objects**: Immutable objects without identity (PIN, GameScore)
- **Domain Services**: Business logic that doesn't belong to a single entity (PasswordService, ScoreCalculatorService)
- **Repository Interfaces**: Abstractions for data access (ports in Clean Architecture)

### 3. Screaming Architecture

The directory structure immediately reveals the domain:

```
src/
├── domain/
│   ├── auth/           # Authentication domain
│   ├── quiz/           # Quiz management domain
│   └── game/           # Game play domain
├── application/
│   ├── auth/
│   ├── quiz/
│   └── game/
├── infrastructure/
└── presentation/
```

When you open the codebase, you immediately see "This is a quiz application" rather than "This is a NestJS application".

## Directory Structure

### Complete Structure

```
backend-nestjs/
├── src/
│   ├── domain/                          # Domain Layer (Core Business Logic)
│   │   ├── auth/
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts       # User domain entity
│   │   │   ├── repositories/
│   │   │   │   └── user.repository.interface.ts
│   │   │   └── services/
│   │   │       └── password.service.ts   # Password hashing logic
│   │   ├── quiz/
│   │   │   ├── entities/
│   │   │   │   ├── quiz.entity.ts
│   │   │   │   └── question.entity.ts
│   │   │   └── repositories/
│   │   │       ├── quiz.repository.interface.ts
│   │   │       └── question.repository.interface.ts
│   │   └── game/
│   │       ├── entities/
│   │       │   ├── game-session.entity.ts
│   │       │   └── score.entity.ts
│   │       ├── value-objects/
│   │       │   ├── pin.vo.ts             # PIN value object
│   │       │   └── game-score.vo.ts      # Score calculation
│   │       ├── repositories/
│   │       │   ├── game-session.repository.interface.ts
│   │       │   └── score.repository.interface.ts
│   │       └── services/
│   │           └── score-calculator.service.ts
│   │
│   ├── application/                     # Application Layer (Use Cases)
│   │   ├── auth/
│   │   │   ├── dto/
│   │   │   │   ├── register-user.dto.ts
│   │   │   │   ├── login-user.dto.ts
│   │   │   │   └── auth-response.dto.ts
│   │   │   └── use-cases/
│   │   │       ├── register-user.use-case.ts
│   │   │       └── login-user.use-case.ts
│   │   ├── quiz/
│   │   │   ├── dto/
│   │   │   │   ├── create-quiz.dto.ts
│   │   │   │   └── create-question.dto.ts
│   │   │   └── use-cases/
│   │   │       ├── create-quiz.use-case.ts
│   │   │       ├── get-all-quizzes.use-case.ts
│   │   │       ├── delete-quiz.use-case.ts
│   │   │       ├── create-question.use-case.ts
│   │   │       └── get-quiz-questions.use-case.ts
│   │   └── game/
│   │       ├── dto/
│   │       │   ├── create-game-session.dto.ts
│   │       │   ├── join-game.dto.ts
│   │       │   └── submit-answer.dto.ts
│   │       └── use-cases/
│   │           ├── create-game-session.use-case.ts
│   │           ├── submit-answer.use-case.ts
│   │           └── get-leaderboard.use-case.ts
│   │
│   ├── infrastructure/                  # Infrastructure Layer (Adapters)
│   │   ├── database/
│   │   │   └── prisma.service.ts        # Prisma client wrapper
│   │   ├── repositories/
│   │   │   ├── prisma-user.repository.ts
│   │   │   ├── prisma-quiz.repository.ts
│   │   │   ├── prisma-question.repository.ts
│   │   │   ├── prisma-game-session.repository.ts
│   │   │   └── prisma-score.repository.ts
│   │   ├── auth/
│   │   │   ├── jwt.strategy.ts          # JWT authentication strategy
│   │   │   └── jwt-auth.guard.ts        # JWT guard
│   │   └── config/
│   │       └── configuration.ts         # Application configuration
│   │
│   ├── presentation/                    # Presentation Layer (API)
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── quiz.controller.ts
│   │   │   └── game.controller.ts
│   │   ├── gateways/
│   │   │   └── game.gateway.ts          # WebSocket gateway
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   └── interceptors/
│   │       └── logging.interceptor.ts
│   │
│   ├── modules/                         # NestJS Modules
│   │   ├── auth.module.ts
│   │   ├── quiz.module.ts
│   │   ├── game.module.ts
│   │   └── database.module.ts
│   │
│   ├── app.module.ts                    # Root module
│   └── main.ts                          # Application entry point
│
├── prisma/
│   └── schema.prisma                    # Prisma database schema
│
├── test/                                # E2E tests
│   ├── auth.e2e-spec.ts
│   ├── quiz.e2e-spec.ts
│   └── game.e2e-spec.ts
│
└── package.json
```

## Layer Responsibilities

### Domain Layer

**What it contains:**
- Pure business logic
- Domain entities with behavior
- Value objects
- Domain services
- Repository interfaces (ports)

**What it does NOT contain:**
- Any framework-specific code
- Database access code
- HTTP/WebSocket code
- External service dependencies

**Example:**
```typescript
// domain/game/entities/game-session.entity.ts
export class GameSession {
  start(): void {
    if (this.status !== 'waiting') {
      throw new Error('Game can only be started from waiting status');
    }
    this.status = 'active';
  }
}
```

### Application Layer

**What it contains:**
- Use cases (application-specific business rules)
- DTOs (Data Transfer Objects)
- Input validation rules
- Application service interfaces

**What it does NOT contain:**
- HTTP controllers
- Database implementation details
- Framework-specific decorators (except validation)

**Example:**
```typescript
// application/auth/use-cases/register-user.use-case.ts
@Injectable()
export class RegisterUserUseCase {
  async execute(dto: RegisterUserDto): Promise<User> {
    // Orchestrates domain logic and repository calls
  }
}
```

### Infrastructure Layer

**What it contains:**
- Database access implementations (Prisma repositories)
- Authentication implementations (JWT strategy)
- External service integrations
- Framework-specific configuration

**Example:**
```typescript
// infrastructure/repositories/prisma-user.repository.ts
@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}
  
  async create(...): Promise<User> {
    const user = await this.prisma.user.create({...});
    return new User(...); // Returns domain entity
  }
}
```

### Presentation Layer

**What it contains:**
- REST API controllers
- WebSocket gateways
- Request/Response DTOs
- HTTP filters and interceptors
- API documentation decorators

**Example:**
```typescript
// presentation/controllers/auth.controller.ts
@Controller('auth')
export class AuthController {
  constructor(private readonly registerUseCase: RegisterUserUseCase) {}
  
  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    return this.registerUseCase.execute(dto);
  }
}
```

## Key Design Patterns

### 1. Repository Pattern

Abstracts data access through interfaces defined in the domain layer:

```typescript
// Domain layer defines the interface
export interface IUserRepository {
  create(username: string, email: string, password: string): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
}

// Infrastructure layer implements it
@Injectable()
export class PrismaUserRepository implements IUserRepository {
  // Implementation using Prisma
}
```

### 2. Use Case Pattern

Each use case represents a single application operation:

```typescript
@Injectable()
export class CreateQuizUseCase {
  constructor(private readonly quizRepository: IQuizRepository) {}
  
  async execute(dto: CreateQuizDto, userId: number): Promise<Quiz> {
    return this.quizRepository.create(dto.title, dto.description, userId);
  }
}
```

### 3. Value Object Pattern

Encapsulates business rules in immutable objects:

```typescript
export class PIN {
  private readonly value: string;
  
  constructor(pin: string) {
    this.validate(pin);
    this.value = pin;
  }
  
  private validate(pin: string): void {
    if (!/^\d{6}$/.test(pin)) {
      throw new Error('PIN must be exactly 6 digits');
    }
  }
  
  static generate(): PIN {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    return new PIN(pin);
  }
}
```

### 4. Dependency Injection

NestJS provides powerful DI. All dependencies are injected through constructors:

```typescript
@Injectable()
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}
}
```

## Database Schema (Prisma)

```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String
  isAdmin   Boolean  @default(false)
  createdAt DateTime @default(now())
  
  quizzes Quiz[]
  scores  Score[]
}

model Quiz {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  createdById Int
  createdAt   DateTime @default(now())
  
  createdBy User         @relation(fields: [createdById], references: [id])
  questions Question[]
  sessions  GameSession[]
}

// ... other models
```

## Testing Strategy

### Unit Tests

Test each layer in isolation:

```typescript
// Domain entity tests
describe('GameSession', () => {
  it('should start game from waiting status', () => {
    const session = new GameSession(1, 1, '123456', 'waiting', 0, new Date());
    session.start();
    expect(session.status).toBe('active');
  });
  
  it('should throw error when starting non-waiting game', () => {
    const session = new GameSession(1, 1, '123456', 'active', 0, new Date());
    expect(() => session.start()).toThrow();
  });
});

// Use case tests
describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordService: jest.Mocked<PasswordService>;
  
  beforeEach(() => {
    userRepository = {
      exists: jest.fn(),
      create: jest.fn(),
    } as any;
    
    passwordService = {
      hash: jest.fn(),
      isValidPassword: jest.fn(),
    } as any;
    
    useCase = new RegisterUserUseCase(userRepository, passwordService);
  });
  
  it('should create user with hashed password', async () => {
    passwordService.isValidPassword.mockReturnValue(true);
    passwordService.hash.mockResolvedValue('hashed_password');
    userRepository.exists.mockResolvedValue(false);
    
    await useCase.execute({
      username: 'test',
      email: 'test@test.com',
      password: 'password123',
    });
    
    expect(passwordService.hash).toHaveBeenCalledWith('password123');
    expect(userRepository.create).toHaveBeenCalledWith(
      'test',
      'test@test.com',
      'hashed_password',
      false,
    );
  });
});
```

### Integration Tests

Test repository implementations with actual database:

```typescript
describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let prisma: PrismaService;
  
  beforeAll(async () => {
    // Setup test database
  });
  
  it('should create and retrieve user', async () => {
    const user = await repository.create('test', 'test@test.com', 'hash');
    const found = await repository.findByEmail('test@test.com');
    expect(found?.username).toBe('test');
  });
});
```

### E2E Tests

Test complete API flows:

```typescript
describe('Auth E2E', () => {
  it('should register and login user', async () => {
    // Register
    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(201);
    
    // Login
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(200);
    
    expect(loginResponse.body).toHaveProperty('token');
  });
});
```

## Benefits of This Architecture

### 1. Maintainability
- Clear separation of concerns
- Easy to locate and modify code
- Each component has a single responsibility

### 2. Testability
- Each layer can be tested independently
- Mock dependencies easily through interfaces
- TDD-friendly structure

### 3. Scalability
- Easy to add new features (new use cases, entities)
- Can extract domains into microservices if needed
- Framework-agnostic core logic

### 4. Type Safety
- Full TypeScript coverage
- Prisma provides compile-time type checking
- DTOs validated at runtime

### 5. Documentation
- Code structure serves as documentation
- Clear intent from directory names
- Self-documenting through types and interfaces

## Migration from Old Backend

### Key Differences

| Aspect | Old (Express) | New (NestJS) |
|--------|--------------|--------------|
| Structure | Monolithic single file | Modular, layered architecture |
| Database | SQLite with callbacks | PostgreSQL with Prisma (async/await) |
| Validation | Manual validation | class-validator decorators |
| DI | Manual instantiation | NestJS dependency injection |
| Testing | Limited test structure | Comprehensive testing at all layers |
| Type Safety | Partial | Full TypeScript + Prisma |

### Backward Compatibility

The new backend maintains API compatibility:

- Same endpoint paths (`/api/auth/login`, `/api/quizzes`, etc.)
- Same request/response formats
- Same WebSocket events
- Frontend requires NO changes

## Next Steps

1. ✅ Complete remaining repository implementations
2. ✅ Create NestJS modules for dependency injection
3. ✅ Implement controllers and WebSocket gateway
4. ⬜ Write comprehensive test suite
5. ⬜ Setup database migrations
6. ⬜ Update Docker configuration
7. ⬜ Create migration scripts from SQLite
8. ⬜ Update documentation

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)

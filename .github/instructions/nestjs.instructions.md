---
applyTo: "application/backend/**"
description: "NestJS 11 + Prisma + GraphQL best practices for Pleey backend"
---

# NestJS Backend Best Practices — Pleey

> **Architecture, layers, dependency rules, DI, error handling, Prisma, config, auth, testing, and coding standards** are documented in the project docs. Do not duplicate — refer to:
>
> - `docs/technical/architecture/backend.md` — directory structure, use-case pattern, ports & adapters, resolvers, error chain, modules, config, Biome boundaries, testing
> - `docs/technical/architecture/index.md` — cross-cutting architecture, ports & adapters, error strategy, DI patterns, Prisma data model
> - `docs/technical/development/backend.md` — commands, testing conventions, use-cases, ports, resolvers, config, performance (DataLoader, Redis/Valkey)
> - `docs/technical/development/index.md` — naming conventions, commit standards, i18n, error handling, dead code policy

This file adds **NestJS-specific patterns and rules** not covered by the project docs.

---

## 1. DTOs and Validation — HIGH

Use `class-validator` decorators for **all** inputs. Create separate DTOs per operation.

```typescript
export class CreateUserInput {
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password must contain uppercase, lowercase and number",
  })
  password: string;
}
```

- Validate all inputs — missing validation is a common pitfall
- Use `class-transformer` for transformation when needed
- Apply `ValidationPipe` globally or at resolver/controller level

---

## 2. Rate Limiting

```typescript
@Controller("auth")
@UseGuards(ThrottlerGuard)
export class AuthController {
  @Post("login")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
```

---

## 3. Logging

- Use NestJS built-in `Logger` class
- Add contextual information: `new Logger("ServiceName")`
- Use proper log levels: `error`, `warn`, `log`, `debug`, `verbose`
- Never log secrets or PII

---

## 4. WebSocket Patterns

### Socket.io Gateways

```typescript
@WebSocketGateway({ cors: true })
export class GameGateway {
  @SubscribeMessage("joinRoom")
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomDto,
  ) {
    return this.gameService.joinRoom(client, data);
  }
}
```

- Keep gateways thin — delegate to services
- Validate WebSocket payloads with DTOs
- Handle disconnections gracefully
- Use rooms for broadcasting to specific groups

---

## 5. Common Pitfalls to Avoid

- **Circular Dependencies:** Avoid importing modules that create circular references
- **Heavy Controllers/Resolvers:** Don't put business logic in resolvers
- **Missing Validation:** Always validate input data with DTOs
- **NestJS Exceptions in Domain:** Domain/application layers throw plain `Error(errorCode)`
- **Manual Instance Creation:** Use DI; don't create instances with `new`
- **Synchronous Operations:** Use async/await for database and external API calls
- **Memory Leaks:** Properly dispose of subscriptions and event listeners
- **Direct process.env:** Only `src/app/config/**` may read environment variables

---

## References

- [NestJS docs](https://docs.nestjs.com)
- [Prisma docs](https://www.prisma.io/docs)
- [Apollo Server docs](https://www.apollographql.com/docs/apollo-server)
- [class-validator](https://github.com/typestack/class-validator)

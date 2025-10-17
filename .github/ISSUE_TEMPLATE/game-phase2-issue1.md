---
name: "[Phase 2.1] Add Redis Caching Layer"
about: Implement Redis for high-performance game state caching
title: "[Game MMO] Add Redis Caching Layer"
labels: enhancement, game-feature, phase-2, p0-critical
assignees: ''
---

## 🎯 Objective
Implement Redis caching to dramatically reduce database load and improve response times for game state queries.

## 📋 Context
Part of **Phase 2: Performance & Scalability** from the [MMO Game Feature Roadmap](../MMO_GAME_FEATURE_ROADMAP.md).

Currently, every game state query hits the database. With dozens of concurrent players, this creates a bottleneck. Redis caching will enable:
- Sub-10ms game state lookups
- Reduced database load by 80%+
- Foundation for horizontal scaling (Phase 2.2)

## ✅ Acceptance Criteria

### Infrastructure
- [ ] Add Redis container to `docker-compose.yaml`
- [ ] Install `@nestjs/cache-manager` and `cache-manager-redis-store`
- [ ] Configure Redis connection with environment variables
- [ ] Set up Redis persistence (AOF + RDB)
- [ ] Configure memory limits and eviction policy

### Implementation
- [ ] Create `RedisModule` and `CacheService`
- [ ] Cache game sessions by PIN (TTL: 1 hour)
- [ ] Cache quiz questions by quizId (TTL: 24 hours)
- [ ] Cache active player lists by PIN (TTL: 5 minutes)
- [ ] Implement cache invalidation on updates
- [ ] Add fallback to database on cache miss

### Monitoring
- [ ] Add cache hit/miss metrics
- [ ] Monitor cache memory usage
- [ ] Track cache latency
- [ ] Set up alerts for cache failures

### Testing
- [ ] Unit tests for `CacheService`
- [ ] Integration tests for cache hit/miss scenarios
- [ ] Test cache invalidation
- [ ] Test fallback behavior on Redis failure

## 📁 Files to Create/Modify

### New Files
```
backend/src/infrastructure/cache/
├── redis.module.ts                    # Redis module
├── cache.service.ts                   # Cache abstraction
├── cache.service.spec.ts
└── README.md                          # Cache strategy docs

docker-compose.yaml                    # Add Redis service
.env.example                           # Add Redis vars
```

### Modified Files
```
backend/src/app.module.ts              # Import RedisModule
backend/src/infrastructure/repositories/
├── game-session.repository.ts         # Add caching
├── question.repository.ts             # Add caching
└── *.repository.ts                    # Cache patterns

backend/package.json                   # Add Redis deps
```

## 🔧 Technical Implementation Guide

### 1. Docker Compose - Add Redis Service
```yaml
# docker-compose.yaml
services:
  redis:
    image: redis:7-alpine
    container_name: quiz-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  redis-data:
```

### 2. Environment Variables
```bash
# .env.example
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_TTL=3600
```

### 3. Redis Module
```typescript
// backend/src/infrastructure/cache/redis.module.ts
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { CacheService } from './cache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST', 'redis'),
        port: configService.get('REDIS_PORT', 6379),
        ttl: configService.get('REDIS_TTL', 3600),
      }),
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class RedisModule {}
```

### 4. Cache Service
```typescript
// backend/src/infrastructure/cache/cache.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  // Game-specific helpers
  async getGameSession(pin: string) {
    return this.get(`game:session:${pin}`);
  }

  async setGameSession(pin: string, session: any, ttl = 3600) {
    return this.set(`game:session:${pin}`, session, ttl);
  }

  async invalidateGameSession(pin: string) {
    return this.del(`game:session:${pin}`);
  }
}
```

### 5. Repository with Caching
```typescript
// backend/src/infrastructure/repositories/game-session.repository.ts
@Injectable()
export class GameSessionPrismaRepository implements GameSessionRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService, // Inject cache
  ) {}

  async findByPin(pin: string): Promise<GameSession | null> {
    // Try cache first
    const cached = await this.cacheService.getGameSession(pin);
    if (cached) {
      return this.toDomain(cached);
    }

    // Cache miss - fetch from database
    const session = await this.prisma.gameSession.findUnique({
      where: { pin },
    });

    if (session) {
      // Store in cache
      await this.cacheService.setGameSession(pin, session);
    }

    return session ? this.toDomain(session) : null;
  }

  async update(session: GameSession): Promise<void> {
    await this.prisma.gameSession.update({
      where: { id: session.id },
      data: this.toData(session),
    });

    // Invalidate cache on update
    await this.cacheService.invalidateGameSession(session.pin);
  }
}
```

## 📊 Cache Strategy

### Cache Keys Pattern
```
game:session:{pin}              # Game session data
quiz:{quizId}                   # Quiz details
quiz:{quizId}:questions         # Quiz questions
game:{pin}:players              # Active player list
user:{userId}:session           # User's current session
```

### TTL Strategy
- **Game Sessions**: 1 hour (extends on access)
- **Quiz Data**: 24 hours (rarely changes)
- **Player Lists**: 5 minutes (frequently updated)
- **User Sessions**: 30 minutes

### Invalidation Rules
- **On game start**: Invalidate player list
- **On answer submit**: Update leaderboard cache
- **On game end**: Invalidate all game caches
- **On quiz update**: Invalidate quiz + questions cache

## 📊 Success Metrics
- [ ] Cache hit rate >80% for game sessions
- [ ] Database query count reduced by 70%+
- [ ] Game state lookups <10ms (99th percentile)
- [ ] Redis memory usage <256MB at peak
- [ ] Zero data loss on Redis restart (AOF enabled)

## 🔗 Dependencies
- **Blocks**: Issue 2.2 (Horizontal Scaling with Redis Adapter)
- **Blocked by**: None (can be implemented in parallel with Phase 1)

## 📚 References
- [NestJS Caching](https://docs.nestjs.com/techniques/caching)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [Cache Strategies](https://docs.aws.amazon.com/AmazonElastiCache/latest/mem-ug/Strategies.html)

## 💡 Notes
- Use Redis Pub/Sub in Phase 2.2 for multi-server scaling
- Consider Redis Cluster for production (>10GB data)
- Monitor cache evictions - may need to increase memory

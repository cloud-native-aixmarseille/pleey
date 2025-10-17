# ⚡ Phase 1 Quick Start Guide

This guide helps you start implementing Phase 1 (WebSocket Infrastructure) immediately.

## 🎯 Phase 1 Goal

**Build the foundation for real-time multiplayer gameplay**

By the end of Phase 1, players will be able to:
- Join a game session via PIN
- See other players join in real-time
- Start the game and receive questions simultaneously
- Submit answers and see results in real-time
- View live leaderboards

**Timeline**: 2-3 weeks | **Story Points**: 18 SP

## 📋 Phase 1 Issues Overview

```
Issue 1.1: WebSocket Gateway (8 SP, P0) ━━━━━━━━ Week 1
    │
    ├─ Setup Socket.io server in NestJS
    ├─ Implement JWT authentication
    ├─ Handle connection/disconnection
    └─ Create room-based messaging
    
Issue 1.2: Real-Time Events (5 SP, P0) ━━━━━━━━ Week 2
    │
    ├─ StartGameUseCase + event
    ├─ NextQuestionUseCase + event
    ├─ Update SubmitAnswerUseCase
    └─ Complete game flow
    
Issue 1.3: Connection Recovery (5 SP, P1) ━━━━━ Week 2-3
    │
    ├─ Heartbeat mechanism
    ├─ Auto-reconnect logic
    ├─ Connection status UI
    └─ State preservation
```

## 🚀 Getting Started - Step by Step

### Day 1: Environment Setup

#### 1. Ensure Development Environment Ready
```bash
# Navigate to project
cd /path/to/quiz-app

# Ensure dependencies installed
cd backend
npm install

# Check database is ready
npx prisma migrate status

# Start backend in dev mode (separate terminal)
npm run start:dev
```

#### 2. Verify Current Architecture
```bash
# Read these documents in order:
1. ../ARCHITECTURE.md              # Understand current system
2. ../backend/ARCHITECTURE.md      # Backend structure
3. .github/MMO_GAME_FEATURE_ROADMAP.md  # New architecture
```

#### 3. Review Socket.io Dependencies
```bash
# Check package.json
cat backend/package.json | grep socket

# Expected packages:
# - @nestjs/platform-socket.io
# - @nestjs/websockets
# - socket.io
```

### Day 2-3: Issue 1.1 - WebSocket Gateway

#### Step 1: Create WebSocket Module Structure
```bash
cd backend/src/infrastructure
mkdir -p websocket
cd websocket

# Files to create:
touch websocket.module.ts
touch game.gateway.ts
touch game.gateway.spec.ts
```

#### Step 2: Implement WebSocket Module
```typescript
// backend/src/infrastructure/websocket/websocket.module.ts
import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';

@Module({
  providers: [GameGateway],
  exports: [GameGateway],
})
export class WebSocketModule {}
```

#### Step 3: Implement Basic Gateway
```typescript
// backend/src/infrastructure/websocket/game.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('GameGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // TODO: Add JWT authentication
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // TODO: Clean up player from games
  }

  @SubscribeMessage('join-game')
  handleJoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { pin: string; username: string; userId: number },
  ) {
    this.logger.log(`Player ${payload.username} joining game ${payload.pin}`);
    
    // Join the Socket.io room (PIN = room)
    client.join(payload.pin);
    
    // Emit to all players in the room
    this.server.to(payload.pin).emit('player-joined', {
      username: payload.username,
      userId: payload.userId,
    });
    
    return { success: true };
  }
}
```

#### Step 4: Update App Module
```typescript
// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { HealthModule } from './infrastructure/health';
import { WebSocketModule } from './infrastructure/websocket/websocket.module'; // Add this

@Module({
  imports: [
    HealthModule,
    WebSocketModule, // Add this
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

#### Step 5: Test Basic Connection
```bash
# Start backend
npm run start:dev

# In another terminal, test with Socket.io client
node
> const io = require('socket.io-client');
> const socket = io('http://localhost:3001');
> socket.on('connect', () => console.log('Connected!'));
> socket.emit('join-game', { pin: 'TEST123', username: 'TestUser', userId: 1 });
```

#### Step 6: Write Tests
```typescript
// backend/src/infrastructure/websocket/game.gateway.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { GameGateway } from './game.gateway';

describe('GameGateway', () => {
  let gateway: GameGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameGateway],
    }).compile();

    gateway = module.get<GameGateway>(GameGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  // Add more tests...
});
```

### Day 4-7: Issue 1.2 - Real-Time Events

#### Step 1: Create Use Cases
```bash
cd backend/src/application/game/use-cases

# Create new use cases
touch start-game.use-case.ts
touch start-game.use-case.spec.ts
touch next-question.use-case.ts
touch next-question.use-case.spec.ts
```

#### Step 2: Implement StartGameUseCase
```typescript
// backend/src/application/game/use-cases/start-game.use-case.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import type { GameSessionRepository } from '../../../domain/game/repositories/game-session.repository.interface';
import type { QuestionRepository } from '../../../domain/quiz/repositories/question.repository.interface';

@Injectable()
export class StartGameUseCase {
  constructor(
    private readonly gameSessionRepository: GameSessionRepository,
    private readonly questionRepository: QuestionRepository,
  ) {}

  async execute(pin: string): Promise<{
    question: any;
    questionNumber: number;
    totalQuestions: number;
  }> {
    // Find game session
    const session = await this.gameSessionRepository.findByPin(pin);
    if (!session) {
      throw new NotFoundException('Game session not found');
    }

    // Start the game
    session.start();
    await this.gameSessionRepository.update(session);

    // Get questions
    const questions = await this.questionRepository.findByQuizId(session.quizId);
    const firstQuestion = questions[0];

    return {
      question: {
        id: firstQuestion.id,
        text: firstQuestion.questionText,
        type: firstQuestion.type,
        options: [
          firstQuestion.optionA,
          firstQuestion.optionB,
          firstQuestion.optionC,
          firstQuestion.optionD,
        ].filter(Boolean),
        timeLimit: firstQuestion.timeLimit,
      },
      questionNumber: 1,
      totalQuestions: questions.length,
    };
  }
}
```

#### Step 3: Update Gateway with Use Cases
```typescript
// backend/src/infrastructure/websocket/game.gateway.ts
import { StartGameUseCase } from '../../application/game/use-cases/start-game.use-case';

@WebSocketGateway(/* ... */)
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly startGameUseCase: StartGameUseCase, // Inject
  ) {}

  @SubscribeMessage('start-game')
  async handleStartGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { pin: string },
  ) {
    try {
      const result = await this.startGameUseCase.execute(payload.pin);
      
      // Emit to all players in the room
      this.server.to(payload.pin).emit('game-started', result);
      
      return { success: true };
    } catch (error) {
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }
}
```

### Day 8-10: Issue 1.3 - Connection Recovery

#### Step 1: Add Connection Manager
```bash
cd backend/src/infrastructure/websocket
touch connection-manager.service.ts
touch connection-manager.service.spec.ts
```

#### Step 2: Frontend Auto-Reconnect
```typescript
// frontend/src/shared/socket/socket.client.ts
import { io } from 'socket.io-client';
import { API_URL } from '../config/api.config';

export const socket = io(API_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
  timeout: 20000,
});

// Connection event handlers
socket.on('connect', () => {
  console.log('✅ WebSocket connected');
});

socket.on('disconnect', (reason) => {
  console.log('❌ WebSocket disconnected:', reason);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('🔄 WebSocket reconnected after', attemptNumber, 'attempts');
});
```

#### Step 3: Connection Status Indicator
```tsx
// frontend/src/shared/components/ConnectionIndicator.tsx
import { useConnectionStatus } from '../hooks/useConnectionStatus';

export function ConnectionIndicator() {
  const { isConnected, isReconnecting } = useConnectionStatus();

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-success-500 text-sm">
        <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
        Connected
      </div>
    );
  }

  if (isReconnecting) {
    return (
      <div className="flex items-center gap-2 text-secondary-500 text-sm">
        <div className="w-2 h-2 rounded-full bg-secondary-500 animate-spin border-2 border-secondary-500 border-t-transparent" />
        Reconnecting...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-danger-500 text-sm">
      <div className="w-2 h-2 rounded-full bg-danger-500" />
      Disconnected
    </div>
  );
}
```

## ✅ Phase 1 Completion Checklist

### Technical Checklist
- [ ] WebSocket gateway connects successfully
- [ ] JWT authentication works for WebSocket
- [ ] Players can join games via PIN
- [ ] Game starts and all players receive first question
- [ ] Answer submission works with real-time feedback
- [ ] Leaderboard updates in real-time
- [ ] Auto-reconnection works after network drop
- [ ] Connection status indicator shows correct state
- [ ] All unit tests pass
- [ ] Integration tests pass

### User Experience Checklist
- [ ] Players see "Connected" indicator
- [ ] Join game is instant (<100ms)
- [ ] Player count updates in real-time in lobby
- [ ] Game starts simultaneously for all players
- [ ] Questions appear instantly
- [ ] Answer submission is instant
- [ ] Leaderboard updates without page refresh
- [ ] Reconnection happens automatically
- [ ] UI shows "Reconnecting..." during network issues

### Documentation Checklist
- [ ] Code comments added for complex logic
- [ ] WebSocket event contracts documented
- [ ] README updated with Phase 1 completion
- [ ] Architecture diagrams updated

## 🧪 Testing Strategy

### Manual Testing
```bash
# 1. Start backend
cd backend
npm run start:dev

# 2. Start frontend (in another terminal)
cd frontend
npm run dev

# 3. Open multiple browser windows/tabs

# 4. Test scenario:
#    - Create game session
#    - Join from multiple tabs with different usernames
#    - Verify player count updates in all tabs
#    - Start game
#    - Submit answers from all tabs
#    - Verify leaderboard updates in real-time
```

### Automated Testing
```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test

# Run E2E tests (if available)
npm run test:e2e
```

## 🐛 Common Issues & Solutions

### Issue: WebSocket won't connect
```bash
# Solution 1: Check CORS settings
# In game.gateway.ts, verify CORS origin matches frontend URL

# Solution 2: Check port availability
netstat -an | grep 3001

# Solution 3: Check firewall
# Ensure port 3001 is open
```

### Issue: Events not emitting
```bash
# Debug: Add logging
this.logger.log('Emitting event to room:', payload.pin);
this.server.to(payload.pin).emit('game-started', result);
this.logger.log('Event emitted successfully');
```

### Issue: Reconnection not working
```bash
# Check Socket.io client config
# Ensure reconnection is enabled in socket.client.ts
reconnection: true,
reconnectionAttempts: Infinity,
```

## 📊 Success Metrics for Phase 1

After Phase 1 completion, you should achieve:
- ✅ WebSocket connection latency: <100ms
- ✅ Event propagation time: <50ms
- ✅ Reconnection time: <2 seconds
- ✅ Concurrent players supported: 10+ per game
- ✅ Test coverage: >80%

## 🎉 Phase 1 Demo Script

Use this script to demo Phase 1 completion:

```
1. "Let me show you our new real-time multiplayer feature!"

2. Open browser, create a game session
   → "Notice the game PIN is generated instantly"

3. Open 3-4 more browser tabs
   → "These are different players joining"
   → "Watch the player count update in real-time in ALL tabs"

4. In admin tab, click "Start Game"
   → "See how all players receive the question simultaneously"
   → "No page refresh needed!"

5. Submit answers from different tabs
   → "Watch the leaderboard update in real-time"
   → "Notice the instant feedback"

6. Close one tab (simulate network issue)
   → "Reopen it and rejoin"
   → "Connection recovers automatically!"

7. "This is Phase 1 complete! Next up: Redis caching for even better performance!"
```

## 🚀 Ready for Phase 2?

Once Phase 1 is complete:
1. Merge all PRs to main
2. Tag release: `git tag v1.0.0-phase1`
3. Deploy to staging for testing
4. Move to Phase 2: Redis Caching Layer

---

**Good luck with Phase 1! You've got this! 🎮**

Questions? Check the [main roadmap](MMO_GAME_FEATURE_ROADMAP.md) or open a discussion.

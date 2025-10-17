---
name: "[Phase 1.2] Refactor Game Use Cases for Real-Time Events"
about: Connect game logic to WebSocket events
title: "[Game MMO] Refactor Game Use Cases for Real-Time Events"
labels: enhancement, game-feature, phase-1, p0-critical
assignees: ''
---

## 🎯 Objective
Refactor existing game use cases to emit real-time WebSocket events, enabling synchronized multiplayer gameplay.

## 📋 Context
Part of **Phase 1: Foundation - WebSocket Infrastructure** from the [MMO Game Feature Roadmap](../MMO_GAME_FEATURE_ROADMAP.md).

With the WebSocket gateway in place (Issue 1.1), we now need to integrate game logic with real-time events. This creates a complete game flow from session creation to answer submission.

## ✅ Acceptance Criteria

### Implementation
- [ ] Update `CreateGameSessionUseCase` to emit `session-created` event
- [ ] Update `SubmitAnswerUseCase` to emit `answer-submitted` event
- [ ] Create `StartGameUseCase` with `game-started` event
- [ ] Create `NextQuestionUseCase` with `next-question` event
- [ ] Add event emission in `GameGateway` for each use case
- [ ] Implement room-based broadcasting (events sent only to players in game)
- [ ] Handle edge cases (invalid PIN, game already started, etc.)

### Testing
- [ ] Write unit tests for each use case
- [ ] Integration tests for WebSocket event flow
- [ ] Test error scenarios (e.g., answering before game starts)
- [ ] Verify event payload structure matches frontend expectations

### Documentation
- [ ] Document WebSocket event contracts (event name, payload, response)
- [ ] Update sequence diagrams for game flow

## 📁 Files to Create/Modify

### New Files
```
backend/src/application/game/use-cases/
├── start-game.use-case.ts       # Start game and emit first question
├── start-game.use-case.spec.ts
├── next-question.use-case.ts    # Move to next question
└── next-question.use-case.spec.ts
```

### Modified Files
```
backend/src/application/game/use-cases/
├── create-game-session.use-case.ts   # Add event emission
└── submit-answer.use-case.ts         # Add event emission

backend/src/infrastructure/websocket/
└── game.gateway.ts                   # Add event handlers
```

## 🔧 Technical Implementation Guide

### 1. Start Game Use Case
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
    const session = await this.gameSessionRepository.findByPin(pin);
    if (!session) {
      throw new NotFoundException('Game session not found');
    }

    session.start(); // Changes status to 'active'
    await this.gameSessionRepository.update(session);

    const questions = await this.questionRepository.findByQuizId(session.quizId);
    const firstQuestion = questions[0];

    return {
      question: firstQuestion,
      questionNumber: 1,
      totalQuestions: questions.length,
    };
  }
}
```

### 2. Update Game Gateway
```typescript
// backend/src/infrastructure/websocket/game.gateway.ts
@SubscribeMessage('start-game')
async handleStartGame(client: Socket, payload: { pin: string }) {
  try {
    const result = await this.startGameUseCase.execute(payload.pin);
    this.server.to(payload.pin).emit('game-started', result);
  } catch (error) {
    client.emit('error', { message: error.message });
  }
}

@SubscribeMessage('submit-answer')
async handleSubmitAnswer(client: Socket, payload: SubmitAnswerDto) {
  try {
    const result = await this.submitAnswerUseCase.execute(payload);
    client.emit('answer-result', result);
  } catch (error) {
    client.emit('error', { message: error.message });
  }
}
```

## 📊 WebSocket Event Contracts

### Events From Client → Server
```typescript
// join-game
{ pin: string; username: string; userId: number }

// start-game
{ pin: string }

// submit-answer
{ pin: string; userId: number; answer: string; timeLeft: number }

// next-question
{ pin: string }
```

### Events From Server → Client
```typescript
// player-joined
{ players: Array<{ id: number; username: string }> }

// game-started
{ question: Question; questionNumber: number; totalQuestions: number }

// answer-result
{ isCorrect: boolean; points: number; correctAnswer: string }

// next-question
{ question: Question; questionNumber: number }

// game-ended
{ leaderboard: Array<{ userId: number; username: string; totalPoints: number }> }

// error
{ message: string }
```

## 🧪 Testing Strategy

### Unit Tests
```typescript
describe('StartGameUseCase', () => {
  it('should start game and return first question', async () => {
    // Test implementation
  });

  it('should throw error if session not found', async () => {
    // Test implementation
  });
});
```

### Integration Test
```typescript
describe('Game Flow E2E', () => {
  it('should complete full game lifecycle', async () => {
    // Create session → Join players → Start → Answer → Next → End
  });
});
```

## 📊 Success Metrics
- [ ] Complete game flow works end-to-end
- [ ] All events emit correctly to correct rooms
- [ ] Error handling works for invalid scenarios
- [ ] All tests pass (>80% coverage)

## 🔗 Dependencies
- **Blocks**: Issue 1.3 (Connection Management & Recovery)
- **Blocked by**: Issue 1.1 (Implement NestJS WebSocket Gateway)

## 📚 References
- Project: [ARCHITECTURE.md](../../ARCHITECTURE.md)
- [Socket.io Rooms Documentation](https://socket.io/docs/v4/rooms/)

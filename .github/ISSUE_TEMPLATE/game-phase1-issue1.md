---
name: "[Phase 1.1] Implement NestJS WebSocket Gateway"
about: Establish real-time communication backbone with Socket.io
title: "[Game MMO] Implement NestJS WebSocket Gateway"
labels: enhancement, game-feature, phase-1, p0-critical
assignees: ''
---

## 🎯 Objective
Implement the WebSocket gateway in NestJS to establish the foundation for real-time multiplayer game communication.

## 📋 Context
Part of **Phase 1: Foundation - WebSocket Infrastructure** from the [MMO Game Feature Roadmap](../MMO_GAME_FEATURE_ROADMAP.md).

Currently, the backend has Socket.io dependencies but no NestJS WebSocket gateway implementation. This issue establishes the real-time communication backbone.

## ✅ Acceptance Criteria

### Implementation
- [ ] Create `GameGateway` class with `@WebSocketGateway` decorator
- [ ] Configure Socket.io server with CORS settings
- [ ] Implement JWT authentication for WebSocket connections
- [ ] Handle `connection` and `disconnect` events
- [ ] Implement `join-game` event handler (player joins by PIN)
- [ ] Implement `leave-game` event handler
- [ ] Add error handling for WebSocket errors
- [ ] Use room-based messaging (each game session = Socket.io room)

### Testing
- [ ] Write unit tests for gateway methods
- [ ] Create integration test with Socket.io client
- [ ] Test authentication flow (valid/invalid JWT)
- [ ] Test room join/leave mechanics

### Documentation
- [ ] Add inline comments for complex logic
- [ ] Update API documentation with WebSocket events

## 📁 Files to Create/Modify

### New Files
```
backend/src/infrastructure/websocket/
├── game.gateway.ts              # Main WebSocket gateway
├── game.gateway.spec.ts         # Unit tests
└── websocket.module.ts          # WebSocket module
```

### Modified Files
```
backend/src/app.module.ts        # Import WebSocketModule
```

## 🔧 Technical Implementation Guide

### 1. Create WebSocket Module
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

### 2. Create Game Gateway
```typescript
// backend/src/infrastructure/websocket/game.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // TODO: Authenticate JWT token
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // TODO: Clean up player from active games
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-game')
  handleJoinGame(client: Socket, payload: { pin: string; username: string; userId: number }) {
    // TODO: Validate PIN, add player to game room
    client.join(payload.pin);
    this.server.to(payload.pin).emit('player-joined', {
      // TODO: Emit player list
    });
  }
}
```

## 📊 Success Metrics
- [ ] WebSocket connections establish successfully
- [ ] JWT authentication works correctly
- [ ] Players can join/leave game rooms
- [ ] All tests pass (100% coverage for gateway)

## 🔗 Dependencies
- **Blocks**: Issue 1.2 (Refactor Game Use Cases for Real-Time Events)
- **Blocked by**: None

## 📚 References
- [NestJS WebSocket Documentation](https://docs.nestjs.com/websockets/gateways)
- [Socket.io Server API](https://socket.io/docs/v4/server-api/)

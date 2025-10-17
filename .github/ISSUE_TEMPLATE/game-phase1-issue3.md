---
name: "[Phase 1.3] Add Connection Management & Recovery"
about: Implement resilient WebSocket connections with auto-recovery
title: "[Game MMO] Add Connection Management & Recovery"
labels: enhancement, game-feature, phase-1, p1-high
assignees: ''
---

## 🎯 Objective
Implement robust connection management with auto-reconnection, allowing players to seamlessly rejoin games after network interruptions.

## 📋 Context
Part of **Phase 1: Foundation - WebSocket Infrastructure** from the [MMO Game Feature Roadmap](../MMO_GAME_FEATURE_ROADMAP.md).

In real-world scenarios, players experience network drops, browser refreshes, and connectivity issues. This issue ensures the game remains playable despite these challenges.

## ✅ Acceptance Criteria

### Backend
- [ ] Implement heartbeat/ping-pong mechanism (30s interval)
- [ ] Track active connections per game session
- [ ] Store player state to allow mid-game reconnection
- [ ] Handle connection timeout (disconnect after 2 minutes of inactivity)
- [ ] Clean up stale connections on server restart
- [ ] Allow reconnection with same userId + PIN

### Frontend
- [ ] Implement auto-reconnect logic with exponential backoff
- [ ] Show connection status indicator (connected/reconnecting/disconnected)
- [ ] Preserve game state during reconnection
- [ ] Auto-rejoin game room after reconnection
- [ ] Show "reconnecting..." message to user

### Testing
- [ ] Test reconnection after intentional disconnect
- [ ] Test reconnection after server restart
- [ ] Test multiple rapid reconnection attempts
- [ ] Test stale connection cleanup

## 📁 Files to Create/Modify

### New Files
```
backend/src/infrastructure/websocket/
├── connection-manager.service.ts      # Track active connections
├── connection-manager.service.spec.ts

frontend/src/shared/hooks/
├── useConnectionStatus.ts             # Connection state hook

frontend/src/shared/components/
├── ConnectionIndicator.tsx            # UI indicator
```

### Modified Files
```
backend/src/infrastructure/websocket/
└── game.gateway.ts                    # Add heartbeat logic

frontend/src/shared/socket/
└── socket.client.ts                   # Auto-reconnect logic

frontend/src/features/game-play/components/
├── LobbyPage.tsx                      # Handle reconnection
└── PlayingPage.tsx                    # Handle reconnection
```

## 🔧 Technical Implementation Guide

### 1. Backend Connection Manager
```typescript
// backend/src/infrastructure/websocket/connection-manager.service.ts
import { Injectable } from '@nestjs/common';

interface PlayerConnection {
  socketId: string;
  userId: number;
  username: string;
  pin: string;
  lastSeen: Date;
}

@Injectable()
export class ConnectionManagerService {
  private connections = new Map<string, PlayerConnection>();

  addConnection(socketId: string, userId: number, username: string, pin: string) {
    this.connections.set(socketId, {
      socketId,
      userId,
      username,
      pin,
      lastSeen: new Date(),
    });
  }

  updateLastSeen(socketId: string) {
    const conn = this.connections.get(socketId);
    if (conn) {
      conn.lastSeen = new Date();
    }
  }

  removeConnection(socketId: string) {
    this.connections.delete(socketId);
  }

  getConnectionsByPin(pin: string): PlayerConnection[] {
    return Array.from(this.connections.values()).filter(c => c.pin === pin);
  }

  cleanupStaleConnections(timeoutMs: number = 120000) {
    const now = new Date();
    for (const [socketId, conn] of this.connections.entries()) {
      if (now.getTime() - conn.lastSeen.getTime() > timeoutMs) {
        this.connections.delete(socketId);
      }
    }
  }
}
```

### 2. Frontend Auto-Reconnect
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

socket.on('connect', () => {
  console.log('WebSocket connected');
});

socket.on('disconnect', (reason) => {
  console.log('WebSocket disconnected:', reason);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('WebSocket reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log('Reconnection attempt', attemptNumber);
});

socket.on('reconnect_error', (error) => {
  console.error('Reconnection error:', error);
});
```

### 3. Connection Status Hook
```typescript
// frontend/src/shared/hooks/useConnectionStatus.ts
import { useEffect, useState } from 'react';
import { socket } from '../socket/socket.client';

export function useConnectionStatus() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      setIsReconnecting(false);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('reconnect_attempt', () => {
      setIsReconnecting(true);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('reconnect_attempt');
    };
  }, []);

  return { isConnected, isReconnecting };
}
```

### 4. Connection Indicator Component
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
        <div className="w-2 h-2 rounded-full bg-secondary-500 animate-spin" />
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

## 📊 Success Metrics
- [ ] Reconnection succeeds within 2 seconds (95th percentile)
- [ ] Players can rejoin games mid-play after disconnect
- [ ] Connection status indicator updates correctly
- [ ] No duplicate players after reconnection
- [ ] Stale connections cleaned up within 2 minutes

## 🔗 Dependencies
- **Blocks**: Phase 2 work can begin in parallel
- **Blocked by**: Issue 1.2 (Refactor Game Use Cases)

## 📚 References
- [Socket.io Reconnection](https://socket.io/docs/v4/client-initialization/#reconnection)
- [Handling Disconnections](https://socket.io/docs/v4/handling-disconnections/)

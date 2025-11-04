---
sidebar_position: 1
---

# 🏗️ QuizMaster Architecture

Complete documentation of the application's architecture.

## 🎯 Architectural Principles

This application follows modern, maintainable architectural principles:

### Design Principles
- **Separation of concerns**: Frontend, backend, and database are decoupled
- **Intentional monolithic architecture**: Simplicity for the current context (MVP/learning)
- **RESTful API**: Clear, standardized interface between frontend and backend
- **Real-time via WebSocket**: Bidirectional communication for gameplay
- **Stateless backend**: JWT authentication, horizontal scalability is possible

### Modern Technologies
- **React 18**: Modern UI framework with hooks and concurrent features
- **Vite**: Fast, modern build tool (replacement for Webpack/CRA)
- **Tailwind CSS**: Utility-first CSS framework, maintainable and performant
- **NestJS**: Progressive Node.js framework for building efficient, scalable server-side applications
- **Prisma**: Next-generation ORM for type-safe database access
- **PostgreSQL**: Powerful, open-source relational database
- **Socket.io**: Real-time bidirectional event-based communication via NestJS WebSocket Gateways
- **Docker**: Containerization for consistent deployment
- **CNCF-ready**: Architecture compatible with Kubernetes, Prometheus, OpenTelemetry

### Future Scalability
The current architecture can evolve toward:
- **Microservices**: Split services (auth, quiz, game, leaderboard)
- **Kubernetes**: Orchestration and automatic scaling
- **Redis**: Distributed cache and session store
- **Message queue**: RabbitMQ/Kafka for asynchronous events
- **GraphQL**: Optional migration to GraphQL API for more flexible data fetching

## 📐 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                            USERS                            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────┐
│                    NGINX (Frontend)                          │
│  - Serve React static assets                                │
│  - Proxy to the backend                                     │
│  - SSL/TLS termination                                      │
│  - gzip compression                                         │
└────────────────┬────────────────────────────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
      ↓                     ↓
┌─────────────┐      ┌──────────────────┐
│   React     │      │  NestJS Backend  │
│   Frontend  │◄────►│                  │
│             │ WS   │  - REST API      │
│  - UI/UX    │      │  - WebSockets    │
│  - Socket.io│      │  - JWT auth      │
│  - State    │      │  - Prisma ORM    │
└─────────────┘      └────────┬─────────┘
                              │
                              ↓
                     ┌────────────────┐
                     │ PostgreSQL DB  │
                     │                │
                     │  - users       │
                     │  - quizzes     │
                     │  - questions   │
                     │  - sessions    │
                     │  - scores      │
                     └────────────────┘
```

## 🎯 Components

For detailed documentation on each component:

- **[Frontend Architecture](frontend.md)** - React application structure and organization
- **[Backend Architecture](backend.md)** - NestJS backend with DDD and Clean Architecture

## 🔗 External Resources

- [React](https://react.dev/)
- [NestJS](https://nestjs.com/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Socket.io](https://socket.io/)
- [Docker](https://docs.docker.com/)
- [Tailwind CSS](https://tailwindcss.com/)

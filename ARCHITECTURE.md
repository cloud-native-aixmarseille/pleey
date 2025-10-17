# 🏗️ Architecture QuizMaster

Documentation complète de l'architecture de l'application.

## 🎯 Principes Architecturaux

Cette application suit des principes d'architecture moderne et maintenable :

### Principes de Conception
- **Séparation des préoccupations** : Frontend, Backend, et Base de données sont découplés
- **Architecture monolithique intentionnelle** : Simplicité pour le contexte actuel (MVP/apprentissage)
- **RESTful API** : Interface claire et standardisée entre frontend et backend
- **Real-time via WebSocket** : Communication bidirectionnelle pour le gameplay
- **Stateless Backend** : Authentification via JWT, scalabilité horizontale possible

### Technologies Modernes
- **React 18** : Framework UI moderne avec hooks et concurrent features
- **Vite** : Build tool rapide et moderne (remplace Webpack/CRA)
- **Tailwind CSS** : Utility-first CSS framework, maintenable et performant
- **Express.js** : Framework web minimaliste et flexible
- **Socket.io** : WebSocket library mature et bien maintenue
- **Docker** : Containerisation pour déploiement cohérent
- **CNCF-ready** : Architecture compatible avec Kubernetes, Prometheus, OpenTelemetry

### Évolutivité Future
L'architecture actuelle permet d'évoluer vers :
- **Microservices** : Séparation des services (auth, quiz, game, leaderboard)
- **Kubernetes** : Orchestration et scaling automatique
- **PostgreSQL** : Migration de SQLite pour haute concurrence
- **Redis** : Cache et session store distribué
- **Message Queue** : RabbitMQ/Kafka pour événements asynchrones

## 📐 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                         UTILISATEURS                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────┐
│                    NGINX (Frontend)                          │
│  - Servir les fichiers statiques React                      │
│  - Proxy vers Backend                                        │
│  - SSL/TLS Termination                                       │
│  - Compression gzip                                          │
└────────────────┬────────────────────────────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
      ↓                     ↓
┌─────────────┐      ┌──────────────────┐
│   React     │      │   Node.js/Express│
│   Frontend  │◄────►│     Backend      │
│             │ WS   │                  │
│  - UI/UX    │      │  - API REST      │
│  - Socket.io│      │  - WebSocket     │
│  - State    │      │  - Auth JWT      │
└─────────────┘      └────────┬─────────┘
                              │
                              ↓
                     ┌────────────────┐
                     │  SQLite DB     │
                     │                │
                     │  - users       │
                     │  - quizzes     │
                     │  - questions   │
                     │  - sessions    │
                     │  - scores      │
                     └────────────────┘
```

## 🎯 Composants principaux

### 1. Frontend (React + Vite)

**Technologies :**
- React 18
- Vite (build tool)
- Tailwind CSS
- Socket.io-client

**Structure :**
```
frontend/
├── src/
│   ├── App.tsx                    # Orchestrateur principal
│   ├── main.jsx                   # Point d'entrée
│   ├── index.css                  # Styles globaux
│   ├── ARCHITECTURE.md            # Documentation architecture frontend
│   ├── domains/                   # Logique métier (DDD)
│   │   ├── auth/                  # Domaine authentification
│   │   ├── quiz/                  # Domaine gestion quiz
│   │   └── game/                  # Domaine jeu
│   ├── features/                  # Modules fonctionnels
│   │   ├── home/                  # Page d'accueil
│   │   ├── authentication/        # Connexion/Inscription
│   │   ├── quiz-management/       # Gestion admin quiz
│   │   └── game-play/             # Jeu (lobby, playing, leaderboard)
│   └── shared/                    # Infrastructure partagée
│       ├── config/                # Configuration
│       ├── socket/                # Client WebSocket
│       ├── types/                 # Types TypeScript
│       └── hooks/                 # Hooks React personnalisés
├── public/
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

**Vues principales :**
- Home (Accueil)
- Login/Register (Authentification)
- Admin (Gestion des quiz)
- Manage Questions (Édition des questions)
- Join (Rejoindre une partie)
- Lobby (Salle d'attente)
- Playing (Jeu en cours)
- Leaderboard (Classement)

**Flux de données :**
```
User Action → State Update → API Call/WebSocket → Backend
                ↓
            UI Update ← Backend Response
```

### 2. Backend (Node.js + Express)

**Technologies :**
- Express.js
- Socket.io
- SQLite3
- JWT (jsonwebtoken)
- bcrypt

**Structure :**
```
backend/
├── server.js             # Serveur principal
├── package.json
└── data/
    └── quiz.db          # Base de données
```

**Endpoints API REST :**

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/register` | Inscription | ✗ |
| POST | `/api/login` | Connexion | ✗ |
| GET | `/api/health` | Health check | ✗ |
| GET | `/api/quizzes` | Liste des quiz | ✓ |
| POST | `/api/quizzes` | Créer un quiz | ✓ |
| DELETE | `/api/quizzes/:id` | Supprimer un quiz | ✓ |
| GET | `/api/quizzes/:id/questions` | Questions d'un quiz | ✓ |
| POST | `/api/questions` | Ajouter une question | ✓ |
| DELETE | `/api/questions/:id` | Supprimer une question | ✓ |
| POST | `/api/sessions/create` | Créer une session de jeu | ✓ |

**Events WebSocket :**

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-game` | Client → Server | Rejoindre une partie |
| `player-joined` | Server → Clients | Nouveau joueur |
| `start-game` | Client → Server | Démarrer la partie (admin) |
| `game-started` | Server → Clients | Partie démarrée |
| `submit-answer` | Client → Server | Soumettre une réponse |
| `answer-result` | Server → Client | Résultat de la réponse |
| `next-question` | Client → Server | Question suivante (admin) |
| `game-ended` | Server → Clients | Fin de la partie |
| `player-left` | Server → Clients | Joueur déconnecté |

### 3. Base de données (SQLite)

**Schéma :**

```sql
┌─────────────────────┐
│       users         │
├─────────────────────┤
│ id (PK)            │
│ username           │
│ email              │
│ password (hash)    │
│ is_admin           │
│ created_at         │
└─────────────────────┘
         │
         │ 1:N
         ↓
┌─────────────────────┐
│      quizzes        │
├─────────────────────┤
│ id (PK)            │
│ title              │
│ description        │
│ created_by (FK)    │
│ created_at         │
└─────────────────────┘
         │
         │ 1:N
         ↓
┌─────────────────────┐
│     questions       │
├─────────────────────┤
│ id (PK)            │
│ quiz_id (FK)       │
│ question_text      │
│ type               │
│ correct_answer     │
│ option_a           │
│ option_b           │
│ option_c           │
│ option_d           │
│ time_limit         │
│ points             │
└─────────────────────┘
         │
         │ N:1
         ↓
┌─────────────────────┐
│   game_sessions     │
├─────────────────────┤
│ id (PK)            │
│ quiz_id (FK)       │
│ pin (unique)       │
│ status             │
│ current_question   │
│ created_at         │
└─────────────────────┘
         │
         │ 1:N
         ↓
┌─────────────────────┐
│       scores        │
├─────────────────────┤
│ id (PK)            │
│ session_id (FK)    │
│ user_id (FK)       │
│ question_id (FK)   │
│ points             │
│ answer_time        │
│ is_correct         │
│ answered_at        │
└─────────────────────┘
```

## 🔐 Sécurité

### Authentification

**Flux JWT :**
```
1. User login → Email + Password
2. Backend vérifie → bcrypt.compare()
3. JWT généré → jwt.sign({id, username, isAdmin})
4. Token retourné → Client stocke en mémoire
5. Requêtes suivantes → Header: Authorization: Bearer <token>
6. Middleware vérifie → jwt.verify()
```

**Stockage des mots de passe :**
- Hash avec bcrypt (salt rounds: 10)
- Jamais de stockage en clair
- Validation côté serveur

### Protection des routes

```javascript
// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Utilisation
app.get('/api/quizzes', authenticateToken, (req, res) => {
  // Route protégée
});
```

## 🎮 Flux de jeu

### 1. Création d'une partie

```
Admin → Sélectionne Quiz → Crée Session → PIN généré
                                              ↓
                                        Partage PIN
```

### 2. Rejoindre une partie

```
Joueur → Entre PIN → Vérifie session → Rejoint lobby
                                              ↓
                                        Attend démarrage
```

### 3. Déroulement du jeu

```
Admin démarre
    ↓
Question 1 affichée → Chrono démarre
    ↓
Joueurs répondent → Calcul points (justesse + temps)
    ↓
Résultats affichés → Mise à jour classement
    ↓
Admin passe à Question 2 → Répéter
    ↓
Dernière question → Podium final
```

### 4. Calcul des points

```javascript
const basePoints = question.points; // Ex: 1000
const timeBonus = Math.floor((timeLeft / timeLimit) * 500);
const totalPoints = isCorrect ? basePoints + timeBonus : 0;

// Exemple:
// - Réponse correcte en 5s sur 20s
// - Points: 1000 + (5/20 * 500) = 1125 points
```

## 🐳 Architecture Docker

### Développement

```yaml
┌──────────────────┐
│  docker-compose  │
│      dev         │
└────────┬─────────┘
         │
    ┌────┴─────┐
    ↓          ↓
┌─────────┐ ┌──────────┐
│ Backend │ │ Frontend │
│ Node:18 │ │ Node:18  │
│ Port    │ │ + Vite   │
│ 3001    │ │ Port 5173│
└────┬────┘ └──────────┘
     │
     ↓
┌─────────────┐
│ SQLite DB   │
│ Volume      │
└─────────────┘
```

### Production

```yaml
┌──────────────────────┐
│  docker-compose.prod │
└──────────┬───────────┘
           │
    ┌──────┴────────────────┐
    ↓                       ↓
┌─────────────┐      ┌──────────────┐
│   Backend   │      │   Frontend   │
│   Node:18   │      │ Multi-stage: │
│ Production  │      │ 1. Build     │
│ Port 3001   │      │ 2. Nginx     │
└──────┬──────┘      │ Port 80/443  │
       │             └──────────────┘
       │
       ↓
┌──────────────┐
│  SQLite DB   │
│  Volume      │
│  Persistant  │
└──────────────┘
```

### Avec Monitoring

```yaml
┌────────────────────────────────────┐
│  docker-compose + monitoring       │
└────────────┬───────────────────────┘
             │
    ┌────────┴────────┬──────────────┐
    ↓                 ↓              ↓
┌─────────┐    ┌──────────┐   ┌──────────┐
│ Backend │    │ Frontend │   │Prometheus│
│ +       │    │          │   │          │
│ Metrics │    │          │   │ Port 9090│
└────┬────┘    └──────────┘   └────┬─────┘
     │                              │
     │         ┌────────────────────┤
     │         ↓                    ↓
     │    ┌─────────┐         ┌─────────┐
     │    │ Grafana │         │  Loki   │
     │    │Port 3000│         │Port 3100│
     │    └─────────┘         └─────────┘
     │         ↑                    ↑
     │         │                    │
     └─────────┴────────────────────┘
            Métriques + Logs
```

## 🚀 Déploiement

### Stratégies de déploiement

#### 1. Déploiement simple (Single Server)

```
Server VPS/Cloud
├── Docker Engine
├── Application containers
├── Volumes (DB)
└── Nginx (SSL)
```

**Avantages :**
- Simple
- Peu coûteux
- Facile à gérer

**Limites :**
- Pas de haute disponibilité
- Scalabilité limitée

#### 2. Déploiement avec Load Balancer

```
          ┌─────────────┐
          │Load Balancer│
          └──────┬──────┘
                 │
        ┌────────┼────────┐
        ↓        ↓        ↓
    ┌───────┐┌───────┐┌───────┐
    │Server1││Server2││Server3│
    │Backend││Backend││Backend│
    └───┬───┘└───┬───┘└───┬───┘
        └────────┼────────┘
                 ↓
          ┌──────────┐
          │ Database │
          │ (Shared) │
          └──────────┘
```

**Avantages :**
- Haute disponibilité
- Scalabilité horizontale
- Répartition de charge

#### 3. Déploiement Kubernetes (Avancé)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: quizmaster-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: quizmaster/backend:latest
        ports:
        - containerPort: 3001
```

## 📊 Performance

### Optimisations Frontend

1. **Code Splitting**
```javascript
const Admin = lazy(() => import('./views/Admin'));
```

2. **Memoization**
```javascript
const MemoizedComponent = React.memo(ExpensiveComponent);
```

3. **Debouncing**
```javascript
const debouncedSearch = debounce(searchFunction, 300);
```

### Optimisations Backend

1. **Connection Pooling** (si PostgreSQL)
2. **Caching Redis** (optionnel)
3. **Compression gzip**
4. **Rate Limiting**

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite de 100 requêtes
});

app.use('/api/', limiter);
```

### Optimisations Base de données

```sql
-- Indexes pour améliorer les performances
CREATE INDEX idx_quiz_created_by ON quizzes(created_by);
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_sessions_pin ON game_sessions(pin);
CREATE INDEX idx_scores_session ON scores(session_id);
```

## 🔄 CI/CD

### Pipeline GitHub Actions

```
Push to main
    ↓
Build & Test
    ↓
Security Scan (Trivy)
    ↓
Build Docker Images
    ↓
Push to Docker Hub
    ↓
Deploy to Production
    ↓
Health Checks
    ↓
Notifications
```

## 📈 Scalabilité

### Limites actuelles (Single Server)

- ~100 utilisateurs simultanés
- ~10 quiz simultanés
- SQLite (limite pour writes concurrents)

### Améliorations possibles

1. **PostgreSQL** : Meilleure concurrence
2. **Redis** : Caching et sessions
3. **CDN** : Assets statiques
4. **Load Balancer** : Multi-instances
5. **Message Queue** : Tâches asynchrones

## 🛠️ Maintenance

### Logs

```bash
# Structure des logs
logs/
├── backend.log      # Logs applicatifs
├── nginx-access.log # Accès HTTP
├── nginx-error.log  # Erreurs HTTP
└── docker.log       # Logs conteneurs
```

### Monitoring

- **Métriques** : CPU, RAM, Disque, Réseau
- **APM** : Latence, erreurs, throughput
- **Logs** : Agrégation et recherche
- **Alertes** : Notifications automatiques

## 📚 Documentation API

Voir la documentation complète Swagger à `/api/docs` (si implémentée)

## 🔗 Ressources externes

- [React](https://react.dev/)
- [Express.js](https://expressjs.com/)
- [Socket.io](https://socket.io/)
- [Docker](https://docs.docker.com/)
- [Tailwind CSS](https://tailwindcss.com/)
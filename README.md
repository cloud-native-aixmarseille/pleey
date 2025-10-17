# 🎮 QuizMaster - Application de Quiz Interactive

Application complète de quiz interactif type Kahoot avec temps réel, système de points et classements.

## ✨ Fonctionnalités

- ✅ Quiz avec questions à choix multiples et vrai/faux
- 👑 Interface d'administration complète
- 👥 Inscription et connexion des utilisateurs
- ⚡ Points basés sur la justesse ET le temps de réponse
- 🏆 Classement en direct avec podium
- 🎨 Design coloré et fun
- 🔄 Temps réel avec WebSockets

## 🛠️ Technologies

**Backend:**
- NestJS (framework Node.js moderne et modulaire)
- Prisma ORM (accès base de données type-safe)
- PostgreSQL (base de données relationnelle)
- JWT pour l'authentification (stateless)
- bcrypt pour les mots de passe (sécurité)
- Socket.io (WebSockets, temps réel)
- TypeScript (typage fort)

**Frontend:**
- React 18 (UI moderne avec hooks)
- Vite (build tool rapide, remplace CRA)
- Tailwind CSS (utility-first, maintenable)
- Socket.io-client (communication temps réel)

**DevOps & Cloud Native:**
- Docker & Docker Compose (containerisation)
- Nginx (reverse proxy, serving statique)
- PostgreSQL (database conteneurisée)
- Prometheus & Grafana (monitoring, optionnel)
- Compatible CNCF (Kubernetes-ready)

### Pourquoi ces technologies ?

- ✅ **Modernes et maintenues** : Versions LTS et communautés actives
- ✅ **Bien documentées** : Documentation complète et exemples nombreux
- ✅ **Performantes** : Optimisées pour production
- ✅ **Scalables** : Architecture évolutive vers microservices si besoin
- ✅ **Standards ouverts** : Interopérabilité et pérennité

## 📦 Installation

### Option 1 : Installation avec Docker (Recommandé) 🐳

**La façon la plus simple de démarrer !**

```bash
# 1. Cloner le projet
git clone <votre-repo>
cd quiz-app

# 2. Installation complète en une commande
make install

# Ou manuellement :
cp .env.example .env
docker-compose up -d --build
```

L'application sera disponible sur :
- Frontend : http://localhost
- Backend : http://localhost:3001

**Commandes utiles :**
```bash
make help          # Liste toutes les commandes
make logs          # Voir les logs
make backup        # Sauvegarder la base
make restart       # Redémarrer
make clean         # Nettoyer
```

📘 Voir [DOCKER-GUIDE.md](DOCKER-GUIDE.md) pour plus de détails.

---

### Option 2 : Installation manuelle (Développement)

### 1. Backend

```bash
cd backend
npm install
npm start
```

Le serveur démarre sur `http://localhost:3001`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application démarre sur `http://localhost:5173`

## 🚀 Utilisation

### Compte Admin par défaut
- **Email:** admin@quiz.com
- **Mot de passe:** admin123

### Créer un quiz

1. Connectez-vous avec le compte admin
2. Cliquez sur "Créer un quiz"
3. Ajoutez des questions (QCM ou Vrai/Faux)
4. Configurez le temps et les points
5. Lancez une session de jeu

### Jouer

1. Créez un compte ou connectez-vous
2. Entrez le code PIN fourni par l'admin
3. Attendez que la partie démarre
4. Répondez aux questions le plus vite possible !
5. Consultez votre classement final

## 📁 Structure du projet

```
quiz-app/
├── backend/                 # Backend NestJS
│   ├── src/
│   │   ├── domain/         # Logique métier (DDD)
│   │   ├── application/    # Cas d'usage
│   │   ├── infrastructure/ # Implémentations (Prisma)
│   │   └── presentation/   # API (Controllers/Gateways)
│   ├── prisma/
│   │   └── schema.prisma   # Schéma base de données
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── domains/        # Logique métier par domaine
│   │   ├── features/       # Composants fonctionnels
│   │   └── shared/         # Infrastructure partagée
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── docker-compose.yaml     # Configuration Docker
└── README.md
```

## 🎯 Configuration Tailwind

Créez `frontend/tailwind.config.js`:

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## 🎨 Configuration Vite

Créez `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
})
```

## 📝 Créer le fichier CSS

Créez `frontend/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 🎮 Flux de jeu

1. **Lobby:** Les joueurs rejoignent avec un code PIN
2. **Admin** démarre la partie
3. **Questions:** Affichées une par une avec chronomètre
4. **Réponses:** Points calculés selon justesse + rapidité
5. **Classement:** Mis à jour après chaque question
6. **Podium final:** Top 3 + classement complet

## 🔒 Sécurité

- Mots de passe hashés avec bcrypt
- Authentification JWT
- Routes protégées
- Validation des données

## 📊 Base de données

**PostgreSQL** avec Prisma ORM

Tables:
- `users` - Utilisateurs et admins
- `quizzes` - Quiz créés
- `questions` - Questions des quiz
- `game_sessions` - Sessions de jeu en cours
- `scores` - Scores et statistiques

La base de données est gérée par Prisma avec des migrations automatiques.


## 🚧 Améliorations possibles

- [ ] Chat en temps réel
- [ ] Statistiques détaillées
- [ ] Thèmes personnalisés
- [ ] Export des résultats
- [ ] Mode équipes
- [ ] Questions avec images
- [ ] Sauvegarde des parties
- [ ] Système de badges

## 📚 Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture détaillée du système
- [CONTRIBUTING.md](CONTRIBUTING.md) - Guide de contribution
- [TESTING.md](TESTING.md) - Guide des tests
- [DOCKER-GUIDE.md](DOCKER-GUIDE.md) - Guide Docker complet
- [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md) - Checklist de déploiement
- [MONITORING-GUIDE.md](MONITORING-GUIDE.md) - Guide de monitoring
- [QUICK-REFERENCE.md](QUICK-REFERENCE.md) - Référence rapide des commandes
- [AGENTS.md](AGENTS.md) - Instructions pour les agents IA
- [CLAUDE.md](CLAUDE.md) - Instructions spécifiques pour Claude AI

## 📜 Licence

MIT

## 👨‍💻 Auteur

Créé avec ❤️ pour l'apprentissage interactif
# 🎮 QuizMaster - Application de Quiz Interactive

Application complète de quiz interactif type Kahoot avec temps réel, système de points et classements.

## ✨ Fonctionnalités

- ✅ Quiz avec questions à choix multiples et vrai/faux
- 👑 Interface d'administration complète
- 👥 Inscription et connexion des utilisateurs
- ⚡ Points basés sur la justesse ET le temps de réponse
- 🏆 Classement en direct avec podium
- 🎨 Cyber Arcade design system (retro synthwave aesthetic)
- 🔄 Temps réel avec WebSockets
- 🌍 Support multilingue (Anglais/Français)

## 🚀 Quick Start

```bash
# Installation en une commande
make install

# Démarrer l'application
make up
```

L'application sera disponible sur :
- Frontend : http://localhost
- Backend : http://localhost:3001

**Compte admin par défaut :**
- Email: admin@quiz.com
- Mot de passe: admin123

📘 **Pour plus de détails** : Voir [Guide de démarrage rapide](docs/docs/functional/quickstart.md)

## 🛠️ Stack Technique

**Backend:** NestJS + Prisma ORM + PostgreSQL + Socket.io + JWT  
**Frontend:** React 18 + Vite + Tailwind CSS  
**DevOps:** Docker + Nginx + Prometheus + Grafana

📘 **Pour l'architecture complète** : Voir [Architecture](docs/docs/technical/architecture.md)

## 📚 Documentation

La documentation complète est disponible dans le dossier `/docs` via Docusaurus.

### 📖 Pour les utilisateurs
- **[Guide de démarrage rapide](docs/docs/functional/quickstart.md)** - Installation et premiers pas
- **[Guide Admin/Hôte](docs/docs/functional/admin-host-guide.md)** - Créer et animer des quiz

### 🛠️ Pour les développeurs
- **[Architecture](docs/docs/technical/architecture.md)** - Architecture technique du système
- **[Guide Docker](docs/docs/technical/docker-guide.md)** - Utilisation de Docker
- **[Tests](docs/docs/technical/testing.md)** - Guide des tests
- **[Design System](docs/docs/technical/design-system.md)** - Cyber Arcade design system
- **[Déploiement](docs/docs/technical/deployment.md)** - Checklist de déploiement
- **[Monitoring](docs/docs/technical/monitoring.md)** - Guide de monitoring
- **[Sécurité](docs/docs/technical/security.md)** - Politique de sécurité
- **[i18n](docs/docs/technical/i18n.md)** - Internationalisation
- **[Accessibilité](docs/docs/technical/accessibility.md)** - Guide d'accessibilité
- **[Référence rapide](docs/docs/technical/quick-reference.md)** - Commandes et références

### 🤖 Pour les agents IA
- **[AGENTS.md](AGENTS.md)** - Instructions pour les agents IA
- **[CLAUDE.md](CLAUDE.md)** - Instructions spécifiques pour Claude

### 🤝 Contribution
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Guide de contribution

## 📜 Licence

MIT

## 👨‍💻 Auteur

Créé avec ❤️ pour l'apprentissage interactif

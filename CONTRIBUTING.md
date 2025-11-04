# 🤝 Guide de contribution - QuizMaster

Merci de votre intérêt pour contribuer à QuizMaster ! Ce guide vous aidera à démarrer.

## 📚 Documentation complète

**La documentation détaillée est disponible dans `/docs`.**

Pour les guides complets :
- **[Tests](docs/docs/technical/testing.md)** - Guide complet des tests
- **[Architecture](docs/docs/technical/architecture.md)** - Architecture du système
- **[Design System](docs/docs/technical/design-system.md)** - Cyber Arcade design system
- **[Docker](docs/docs/technical/docker-guide.md)** - Guide Docker
- **[Security](docs/docs/technical/security.md)** - Sécurité

## 🤝 Code de conduite

- Soyez respectueux et inclusif
- Acceptez les critiques constructives
- Concentrez-vous sur ce qui est le mieux pour la communauté
- Faites preuve d'empathie envers les autres membres

## 🎯 Types de contributions

1. **Corrections de bugs** 🐛
2. **Nouvelles fonctionnalités** ✨
3. **Documentation** 📚
4. **Tests** 🧪
5. **Optimisations** ⚡
6. **Traductions** 🌍

## 🛠️ Configuration de l'environnement

### Prérequis

- Node.js 18+
- Docker & Docker Compose
- Git
- Un éditeur de code (VS Code recommandé)

### Installation rapide

```bash
# 1. Fork le projet sur GitHub

# 2. Cloner votre fork
git clone https://github.com/VOTRE-USERNAME/quiz-app.git
cd quiz-app

# 3. Installer avec Docker (recommandé)
make install
make up

# 4. Créer une branche pour votre contribution
git checkout -b feature/ma-nouvelle-fonctionnalite
```

📘 **Pour plus de détails** : Voir [Docker Guide](docs/docs/technical/docker-guide.md)

## 📝 Standards de code

### Principes de développement

- **SOLID Principles** : Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **DRY** : Don't Repeat Yourself
- **KISS** : Keep It Simple
- **Clean Code** : Code lisible et maintenable
- **Clean Architecture** : Séparation des préoccupations

### Architecture

- **Backend** : NestJS avec DDD (Domain-Driven Design)
- **Frontend** : React avec Clean Architecture
- **Styling** : Tailwind CSS avec Cyber Arcade design system

📘 **Voir** [Architecture](docs/docs/technical/architecture.md) pour les détails complets

### Conventions de nommage

```typescript
// Variables et fonctions : camelCase
const userName = 'John';
const getUserById = (id) => {};

// Classes et composants React : PascalCase
class UserService {}
const QuizCard = () => {};

// Constants : UPPER_SNAKE_CASE
const API_URL = 'http://localhost:3001';
```

### Styling

**Important** : Suivre le [Cyber Arcade Design System](docs/docs/technical/design-system.md)

- Utiliser les couleurs du thème (purple/pink/cyan)
- Appliquer les effets retro (neon glow, pixel shadows)
- Respecter la typographie (Press Start 2P, VT323, Orbitron)

## 🧪 Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# E2E tests
./test-e2e.sh
```

📘 **Guide complet** : [Testing Guide](docs/docs/technical/testing.md)

## 🔄 Process de Pull Request

1. **Créer une branche** depuis `main`
   ```bash
   git checkout -b feature/nom-de-la-fonctionnalite
   ```

2. **Faire vos modifications**
   - Suivre les standards de code
   - Ajouter des tests
   - Mettre à jour la documentation si nécessaire

3. **Tester localement**
   ```bash
   npm test  # Tests unitaires
   ./test-e2e.sh  # Tests E2E
   ```

4. **Commit vos changements**
   ```bash
   git add .
   git commit -m "feat: description de la fonctionnalité"
   ```

5. **Push vers votre fork**
   ```bash
   git push origin feature/nom-de-la-fonctionnalite
   ```

6. **Créer une Pull Request** sur GitHub
   - Décrire clairement vos changements
   - Référencer les issues liées
   - Attendre la revue de code

### Format des messages de commit

Utiliser [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: ajout de nouvelle fonctionnalité
fix: correction de bug
docs: mise à jour documentation
style: formatage code
refactor: refactoring
test: ajout/modification tests
chore: tâches diverses
```

## 🐛 Reporting de bugs

Créer une issue GitHub avec :

1. **Titre clair** décrivant le problème
2. **Description détaillée** du bug
3. **Étapes pour reproduire** le problème
4. **Comportement attendu** vs **comportement observé**
5. **Environnement** (OS, navigateur, version Node.js, etc.)
6. **Screenshots** si applicable

## ✨ Suggestions de fonctionnalités

Créer une issue GitHub avec :

1. **Titre clair** décrivant la fonctionnalité
2. **Description détaillée** de la proposition
3. **Cas d'usage** concrets
4. **Bénéfices** pour les utilisateurs
5. **Mockups** ou exemples si applicable

## 📚 Ressources utiles

### Documentation technique
- [Architecture](docs/docs/technical/architecture.md)
- [Design System](docs/docs/technical/design-system.md)
- [Testing Guide](docs/docs/technical/testing.md)
- [Docker Guide](docs/docs/technical/docker-guide.md)
- [Deployment](docs/docs/technical/deployment.md)
- [Security](docs/docs/technical/security.md)

### Guides pour agents IA
- [AGENTS.md](AGENTS.md) - Instructions pour les agents IA
- [CLAUDE.md](CLAUDE.md) - Instructions pour Claude

## 🙏 Remerciements

Merci de contribuer à QuizMaster ! Chaque contribution, aussi petite soit-elle, est appréciée. 🎉

---

**Questions ?** Ouvrez une issue GitHub ou consultez la [documentation](docs/).

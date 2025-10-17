# Guide des Tests - QuizMaster

Ce document explique comment exécuter et développer les tests pour l'application QuizMaster.

## Structure des Tests

```
quiz-app/
├── backend/
│   ├── __tests__/
│   │   ├── auth.test.js         # Tests d'authentification
│   │   ├── quiz.test.js         # Tests API quiz
│   │   └── websocket.test.js    # Tests WebSocket
│   ├── jest.config.js           # Configuration Jest
│   └── package.json
└── frontend/
    ├── src/
    │   ├── __tests__/
    │   │   ├── App.test.jsx     # Tests composants React
    │   │   └── utils.test.js    # Tests logique métier
    │   └── test/
    │       └── setup.js         # Configuration tests
    ├── vitest.config.js         # Configuration Vitest
    └── package.json
```

## Backend Tests (Jest)

### Installation des dépendances

```bash
cd backend
npm install
```

### Exécuter les tests

```bash
# Exécuter tous les tests avec couverture
npm test

# Mode watch (re-run automatique)
npm run test:watch

# Exécuter un fichier spécifique
npx jest __tests__/auth.test.js
```

### Tests disponibles

- **auth.test.js** : Tests des endpoints d'authentification
  - Inscription utilisateur
  - Connexion
  - Validation token
  - Health check

- **quiz.test.js** : Tests des endpoints de gestion de quiz
  - CRUD quiz
  - CRUD questions
  - Permissions admin

- **websocket.test.js** : Tests des événements WebSocket
  - Connexion socket
  - Événements de jeu
  - Calcul de score

### Couverture de code

Après l'exécution des tests, le rapport de couverture est disponible dans :
- Console : Affichage résumé
- HTML : `backend/coverage/lcov-report/index.html`

Ouvrir le rapport HTML :
```bash
cd backend
open coverage/lcov-report/index.html  # macOS
xdg-open coverage/lcov-report/index.html  # Linux
```

## Frontend Tests (Vitest)

### Installation des dépendances

```bash
cd frontend
npm install
```

### Exécuter les tests

```bash
# Exécuter tous les tests avec couverture
npm test

# Mode watch (re-run automatique)
npm run test:watch

# Interface UI interactive
npm run test:ui
```

### Tests disponibles

- **App.test.jsx** : Tests des composants React
  - Navigation entre vues
  - Formulaires login/register
  - Interactions utilisateur

- **utils.test.js** : Tests de la logique métier
  - Calcul de score
  - Validation PIN
  - Tri leaderboard
  - Transitions d'état

### Couverture de code

Rapport de couverture disponible dans :
- Console : Affichage résumé
- HTML : `frontend/coverage/index.html`

Ouvrir le rapport HTML :
```bash
cd frontend
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
```

## Tests dans Docker

### Exécuter les tests dans les conteneurs

```bash
# Backend
docker compose exec backend npm test

# Frontend
docker compose run --rm frontend npm test
```

## CI/CD - GitHub Actions

Les tests sont automatiquement exécutés sur GitHub Actions lors de :
- Push sur `main` ou `develop`
- Pull requests vers `main`

### Workflow

1. **test-backend** : Exécute les tests backend avec Jest
2. **test-frontend** : Exécute les tests frontend avec Vitest
3. **build-and-test** : Build Docker et health checks (après tests unitaires)
4. **security-scan** : Scan de sécurité avec Trivy
5. **publish** : Publish images Docker (uniquement sur main)

### Artifacts

Les rapports de couverture sont uploadés comme artifacts et disponibles pendant 30 jours :
- `backend-coverage`
- `frontend-coverage`

Télécharger depuis : Actions → Workflow run → Section "Artifacts"

## Ajouter de nouveaux tests

### Backend (Jest)

Créer un fichier dans `backend/__tests__/` :

```javascript
const request = require('supertest');

describe('My Test Suite', () => {
  test('should do something', () => {
    expect(true).toBe(true);
  });
});
```

### Frontend (Vitest)

Créer un fichier dans `frontend/src/__tests__/` :

```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('My Component', () => {
  it('should render', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Objectifs de couverture

Les seuils de couverture sont configurés dans :
- Backend : `jest.config.js` (50% minimum)
- Frontend : `vitest.config.js` (pas de seuil strict)

## Bonnes pratiques

### Approche TDD (Test-Driven Development)

1. **Écrire les tests avant le code** (Red-Green-Refactor)
   - 🔴 **Red** : Écrire un test qui échoue
   - 🟢 **Green** : Écrire le code minimal pour passer le test
   - 🔵 **Refactor** : Améliorer le code tout en gardant les tests verts

2. **Tester les cas limites** (edge cases)
   - Valeurs nulles, vides, négatives
   - Limites min/max
   - Conditions d'erreur

3. **Mocker les dépendances externes** (DB, API, Socket)
   - Isoler le code testé
   - Tests rapides et déterministes
   - Pas de dépendances sur services externes

4. **Noms descriptifs** pour les tests
   - `it('should return error when email is invalid')`
   - `test('calculates score correctly with time bonus')`
   - Décrire le comportement attendu

5. **Isoler les tests** (pas de dépendances entre tests)
   - Chaque test doit être indépendant
   - Setup et teardown appropriés
   - Ordre d'exécution ne doit pas impacter les résultats

6. **Vérifier la couverture** régulièrement
   - Objectif : >80% de couverture
   - Focus sur les chemins critiques
   - Ne pas sacrifier la qualité pour la quantité

### Clean Testing Principles

- **Tests lisibles** : Arrange-Act-Assert (AAA pattern)
- **Un concept par test** : Tester une seule chose à la fois
- **Tests rapides** : Suite de tests exécutable en <30s
- **Tests maintenables** : Éviter la duplication dans les tests
- **Tests fiables** : Pas de tests flaky (aléatoires)

## Debugging des tests

### Backend

```bash
# Activer les logs détaillés
DEBUG=* npm test

# Exécuter un seul test
npx jest -t "should register a new user"
```

### Frontend

```bash
# Mode debug avec interface
npm run test:ui

# Voir les logs dans le terminal
npm run test:watch
```

## Résolution des problèmes

### Tests backend échouent

- Vérifier que les mocks SQLite sont corrects
- S'assurer que JWT_SECRET est défini
- Nettoyer le cache Jest : `npx jest --clearCache`

### Tests frontend échouent

- Vérifier les mocks de socket.io-client
- S'assurer que jsdom est installé
- Nettoyer node_modules : `rm -rf node_modules && npm install`

### CI/CD échoue

- Vérifier que package-lock.json est à jour
- Tester localement avec les mêmes commandes que CI
- Vérifier les secrets GitHub (JWT_SECRET, etc.)

## Ressources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

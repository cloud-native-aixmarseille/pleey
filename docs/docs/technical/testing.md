---
sidebar_position: 4
---

# Guide des Tests - QuizMaster

Ce document explique comment exécuter et développer les tests pour l'application QuizMaster.

## Testing Pyramid

QuizMaster suit le principe de la **pyramide des tests** :

```
        /\
       /  \  E2E Tests (few) - Smoke tests & critical flows
      /____\
     /      \
    /  INT   \ Integration Tests (some) - Component interactions
   /__________\
  /            \
 /     UNIT     \ Unit Tests (many) - Business logic
/________________\
```

- **Unit Tests** (nombreux) : Logique métier, composants isolés
- **Integration Tests** (quelques-uns) : Interactions entre composants
- **E2E Tests** (peu) : Flux critiques utilisateur et smoke tests

## Structure des Tests

```
quiz-app/
├── backend/
│   ├── src/
│   │   └── domain/          # Tests unitaires domaine (*.spec.ts)
│   ├── test/
│   │   └── app.e2e-spec.ts  # Tests E2E backend
│   ├── vitest.config.ts     # Configuration Vitest
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── __tests__/       # Tests composants React
│   │   ├── domains/
│   │   │   └── **/__tests__/  # Tests services
│   │   └── features/
│   │       └── **/__tests__/  # Tests features
│   ├── vitest.config.js     # Configuration Vitest
│   └── package.json
└── e2e/                     # Tests End-to-End (Playwright)
    ├── tests/
    │   ├── smoke/           # Smoke tests (@smoke)
    │   └── features/        # Use cases nominaux
    ├── playwright.config.ts
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

## E2E Tests (Playwright)

Les tests E2E utilisent **Playwright v1.48.0** avec TypeScript pour valider les flux critiques de bout en bout.

**Total : 16 tests** (7 smoke tests + 9 cas d'usage nominaux)
- **Temps d'exécution** : ~2-3 minutes (smoke tests seuls : ~30s)
- **Framework** : Playwright avec TypeScript
- **Browser** : Chromium (extensible à Firefox, Safari)

### Quick Start

```bash
# 1. Démarrer l'application
docker compose up -d

# 2. Installer les dépendances (première fois)
cd e2e && npm install && npx playwright install chromium

# 3. Exécuter les tests
./test-e2e.sh          # Tous les tests (avec auto-checks)
./test-e2e.sh smoke    # Smoke tests uniquement

# Ou manuellement
cd e2e && npm test                # Tous les tests
cd e2e && npm run test:smoke      # Smoke tests uniquement
```

### Tests Disponibles

#### Smoke Tests (@smoke) - 7 tests
Tests rapides (~30s) pour vérifier la disponibilité de l'application :
- ✅ Frontend charge sans erreur
- ✅ Backend `/health` répond
- ✅ Backend `/health/live` répond
- ✅ Backend `/health/ready` répond
- ✅ Interface login/register visible
- ✅ Navigation de base fonctionne
- ✅ Pas d'erreurs console critiques

**Usage** : Déploiements, CI pipeline, checks rapides

#### Cas d'Usage Nominaux - 9 tests
Tests des flux critiques (happy path uniquement) :

**Authentification** (3 tests)
- Inscription utilisateur
- Connexion valide
- Rejet connexion invalide

**Gestion Quiz** (3 tests)
- Admin crée un quiz
- Admin ajoute des questions
- Liste des quiz accessible

**Jeu** (3 tests)
- Rejoindre avec PIN
- Affichage du lobby
- Gestion PIN invalide

### Exécution des Tests

**Options d'exécution** :
```bash
cd e2e
npm test              # Tous les tests
npm run test:smoke    # Smoke tests uniquement (rapide)
npm run test:ui       # Mode UI interactif
npm run test:headed   # Voir le navigateur
npm run test:debug    # Mode debug step-by-step
npm run report        # Voir le rapport HTML
```

**Avec le script helper** :
```bash
./test-e2e.sh         # Tous (auto-checks Docker)
./test-e2e.sh smoke   # Smoke uniquement
./test-e2e.sh ui      # Mode UI
./test-e2e.sh debug   # Mode debug
```

### Debugging

**Voir les résultats** :
```bash
cd e2e && npm run report  # Rapport HTML avec traces
```

**Artifacts disponibles** :
- Screenshots des échecs : `e2e/test-results/*/test-failed-*.png`
- Vidéos : `e2e/test-results/*/video.webm`
- Traces : Viewer avec `npx playwright show-trace`

**Debug mode** :
```bash
cd e2e && npm run test:debug  # Step-by-step debugging
```

### Structure des Tests

```
e2e/
├── tests/
│   ├── smoke/
│   │   └── health.spec.ts       # 7 smoke tests
│   └── features/
│       ├── auth.spec.ts         # 3 tests authentification
│       ├── quiz-management.spec.ts  # 3 tests gestion quiz
│       └── game-flow.spec.ts    # 3 tests flux de jeu
├── playwright.config.ts         # Configuration Playwright
├── tsconfig.json               # Configuration TypeScript
└── package.json                # Scripts et dépendances
```

### Principes et Bonnes Pratiques

**Pourquoi peu de tests E2E ?**
- Tests lents et coûteux (2-3 min vs secondes pour unit tests)
- Focus sur flux critiques uniquement
- Edge cases couverts par tests unitaires
- Respecte la pyramide : beaucoup de unit tests, peu de E2E

**Bonnes pratiques appliquées** :
- ✅ Tests indépendants (pas d'état partagé)
- ✅ Noms descriptifs
- ✅ Waits appropriés (pas de `waitForTimeout` flaky)
- ✅ Tag `@smoke` pour tests rapides
- ✅ Happy paths uniquement (nominal use cases)

**À éviter** :
- ❌ Tester tous les edge cases en E2E
- ❌ Ajouter des tests E2E inutiles
- ❌ Partager l'état entre tests
- ❌ Utiliser `waitForTimeout` (préférer `waitForLoadState`)

### CI/CD Integration

Les tests E2E s'exécutent automatiquement dans GitHub Actions :
1. Après les tests unitaires (backend + frontend)
2. Smoke tests d'abord (fast-fail)
3. Tous les tests E2E
4. Bloque le déploiement en cas d'échec

**Artifacts uploadés** :
- Rapports HTML : 30 jours
- Screenshots/vidéos : 7 jours

### Ajouter de Nouveaux Tests E2E

**1. Identifier le type** :
- **Smoke test** ? → Rapide (moins de 5s), check basique → `tests/smoke/`
- **Use case critique** ? → Flux complet utilisateur → `tests/features/`

**2. Créer le test** :
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should perform critical action @smoke', async ({ page }) => {
    await page.goto('/');
    await page.click('button#action');
    await expect(page.locator('.success')).toBeVisible();
  });
});
```

**3. Tester** :
```bash
cd e2e && npm run test:debug  # Debug le nouveau test
```

### Troubleshooting

**Tests échouent immédiatement** :
```bash
docker compose ps              # Vérifier les services
curl http://localhost:3001/health  # Tester le backend
```

**Timeouts** :
- Augmenter timeout dans `playwright.config.ts`
- Vérifier que les services démarrent bien

**Tests flaky** :
- Utiliser `waitForLoadState('networkidle')`
- Éviter `waitForTimeout`
- Vérifier les conditions réseau

Pour plus de détails, voir `e2e/README.md`

## Tests dans Docker

### Exécuter les tests dans les conteneurs

```bash
# Backend
docker compose exec backend npm test

# Frontend
docker compose run --rm frontend npm test

# E2E (nécessite que l'application tourne)
docker-compose up -d
cd e2e && npm test
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
- **Tests rapides** : Suite de tests exécutable en moins de 30s
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

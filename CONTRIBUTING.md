# 🤝 Guide de contribution - QuizMaster

Merci de votre intérêt pour contribuer à QuizMaster ! Ce guide vous aidera à démarrer.

## 📋 Table des matières

- [Code de conduite](#code-de-conduite)
- [Comment contribuer](#comment-contribuer)
- [Configuration de l'environnement](#configuration-de-lenvironnement)
- [Standards de code](#standards-de-code)
- [Process de Pull Request](#process-de-pull-request)
- [Reporting de bugs](#reporting-de-bugs)
- [Suggestions de fonctionnalités](#suggestions-de-fonctionnalités)

## 🤝 Code de conduite

- Soyez respectueux et inclusif
- Acceptez les critiques constructives
- Concentrez-vous sur ce qui est le mieux pour la communauté
- Faites preuve d'empathie envers les autres membres

## 🎯 Comment contribuer

### Types de contributions

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

### Installation

```bash
# 1. Fork le projet sur GitHub

# 2. Cloner votre fork
git clone https://github.com/VOTRE-USERNAME/quiz-app.git
cd quiz-app

# 3. Ajouter le remote upstream
git remote add upstream https://github.com/ORIGINAL-OWNER/quiz-app.git

# 4. Créer une branche
git checkout -b feature/ma-nouvelle-fonctionnalite

# 5. Installer les dépendances
cd backend && npm install
cd ../frontend && npm install

# 6. Lancer en mode développement
docker-compose up -d
# Ou sans Docker:
cd backend && npm start &
cd frontend && npm run dev
```

### Variables d'environnement

Créer un fichier `.env` :
```bash
cp .env.example .env
```

## 📝 Standards de code

### Principes de développement

Nous suivons ces principes fondamentaux pour garantir la qualité du code :

#### **SOLID Principles**
- **S**ingle Responsibility : Une fonction/classe = une responsabilité
- **O**pen/Closed : Ouvert à l'extension, fermé à la modification
- **L**iskov Substitution : Les sous-types doivent être substituables à leurs types de base
- **I**nterface Segregation : Interfaces spécifiques plutôt que génériques
- **D**ependency Inversion : Dépendre des abstractions, pas des implémentations concrètes

#### **Autres Principes Clés**
- **DRY (Don't Repeat Yourself)** : Éviter la duplication de code
- **KISS (Keep It Simple, Stupid)** : Privilégier la simplicité
- **YAGNI (You Aren't Gonna Need It)** : Ne pas sur-ingéniérer
- **Clean Code** : Code lisible, maintenable et bien organisé
- **Clean Architecture** : Séparation des préoccupations et indépendance des frameworks

#### **Approche de Développement**
- **TDD (Test-Driven Development)** : Écrire les tests avant le code (voir [TESTING.md](TESTING.md))
- **Refactoring continu** : Améliorer le code existant régulièrement
- **Code reviews** : Revue de code systématique avant merge
- **Documentation** : Code auto-documenté avec commentaires pertinents

#### **Technologies et Dépendances**
- ✅ **Utiliser des technologies à jour** : Préférer les versions LTS et stables
- ✅ **Dépendances bien maintenues** : Vérifier l'activité et la communauté
- ✅ **Sécurité** : Auditer les dépendances (npm audit, Dependabot)
- ✅ **CNCF Technologies** : Privilégier les technologies Cloud Native quand applicable
  - Kubernetes pour l'orchestration (futur)
  - Prometheus pour le monitoring (optionnel, voir [MONITORING-GUIDE.md](MONITORING-GUIDE.md))
  - OpenTelemetry pour l'observabilité (recommandé pour la production)
- ✅ **Standards ouverts** : Préférer les standards ouverts et interopérables

#### **Gestion des Dépendances**
```bash
# Vérifier les mises à jour de sécurité
npm audit

# Mettre à jour les dépendances mineures
npm update

# Vérifier les dépendances obsolètes
npm outdated

# Analyser les vulnérabilités
npm audit fix
```

### JavaScript/React

```javascript
// ✅ Bon
const handleSubmit = async (event) => {
  event.preventDefault();
  try {
    const response = await fetch('/api/quiz', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// ❌ Mauvais
function handleSubmit(event){
event.preventDefault()
fetch('/api/quiz',{method:'POST',body:JSON.stringify(data)}).then(r=>r.json())
}
```

### Conventions de nommage

```javascript
// Variables et fonctions : camelCase
const userName = 'John';
const getUserById = (id) => { };

// Composants React : PascalCase
const QuizCard = () => { };

// Constantes : UPPER_SNAKE_CASE
const API_URL = 'http://localhost:3001';
const MAX_RETRIES = 3;

// Fichiers : kebab-case
// quiz-card.jsx, user-service.js
```

### Structure des composants React

```javascript
import { useState, useEffect } from 'react';

/**
 * Composant QuizCard
 * @param {Object} props - Props du composant
 * @param {string} props.title - Titre du quiz
 * @param {Function} props.onStart - Callback au démarrage
 */
export default function QuizCard({ title, onStart }) {
  // 1. Hooks
  const [loading, setLoading] = useState(false);
  
  // 2. Effects
  useEffect(() => {
    // Logic
  }, []);
  
  // 3. Event handlers
  const handleClick = () => {
    setLoading(true);
    onStart();
  };
  
  // 4. Render
  return (
    <div className="quiz-card">
      <h3>{title}</h3>
      <button onClick={handleClick} disabled={loading}>
        {loading ? 'Chargement...' : 'Démarrer'}
      </button>
    </div>
  );
}
```

### Backend (Express)

```javascript
// Structure des routes
// routes/quiz.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const QuizController = require('../controllers/quiz.controller');

router.get('/', authenticateToken, QuizController.getAll);
router.post('/', authenticateToken, QuizController.create);
router.delete('/:id', authenticateToken, QuizController.delete);

module.exports = router;
```

### Gestion des erreurs

```javascript
// ✅ Bon : Gestion explicite des erreurs
try {
  const result = await fetchData();
  return result;
} catch (error) {
  console.error('Failed to fetch data:', error);
  throw new Error('Unable to fetch data');
}

// ❌ Mauvais : Ignorer les erreurs
const result = await fetchData();
return result;
```

## 🧪 Tests

### Tests Frontend (à implémenter)

```javascript
// frontend/__tests__/QuizCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import QuizCard from '../src/components/QuizCard';

describe('QuizCard', () => {
  it('renders quiz title', () => {
    render(<QuizCard title="Test Quiz" />);
    expect(screen.getByText('Test Quiz')).toBeInTheDocument();
  });

  it('calls onStart when button clicked', () => {
    const handleStart = jest.fn();
    render(<QuizCard title="Test" onStart={handleStart} />);
    
    fireEvent.click(screen.getByText('Démarrer'));
    expect(handleStart).toHaveBeenCalled();
  });
});
```

### Tests Backend (à implémenter)

```javascript
// backend/__tests__/quiz.test.js
const request = require('supertest');
const app = require('../server');

describe('Quiz API', () => {
  it('GET /api/quizzes returns quiz list', async () => {
    const response = await request(app)
      .get('/api/quizzes')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

## 🔄 Process de Pull Request

### 1. Avant de commencer

- Vérifier qu'une issue existe (ou en créer une)
- Discuter de l'approche dans l'issue
- Attendre validation pour les grandes fonctionnalités

### 2. Développement

```bash
# Créer une branche depuis main
git checkout main
git pull upstream main
git checkout -b feature/ma-fonctionnalite

# Développer et commiter
git add .
git commit -m "feat: ajouter la fonctionnalité X"

# Pousser sur votre fork
git push origin feature/ma-fonctionnalite
```

### 3. Commits

Utiliser [Conventional Commits](https://www.conventionalcommits.org/) :

```bash
# Types de commits
feat:     Nouvelle fonctionnalité
fix:      Correction de bug
docs:     Documentation
style:    Formatage (pas de changement de code)
refactor: Refactoring
test:     Ajout de tests
chore:    Maintenance

# Exemples
git commit -m "feat: ajouter mode équipes"
git commit -m "fix: corriger le calcul des points"
git commit -m "docs: mettre à jour le README"
git commit -m "refactor: simplifier la logique WebSocket"
```

### 4. Créer la Pull Request

1. Aller sur GitHub
2. Cliquer sur "New Pull Request"
3. Sélectionner votre branche
4. Remplir le template

**Template de PR :**

```markdown
## Description
Brève description des changements

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Comment tester
1. Étapes pour tester
2. ...

## Checklist
- [ ] Code testé localement
- [ ] Documentation mise à jour
- [ ] Pas de console.log oubliés
- [ ] Commits bien nommés
- [ ] Tests ajoutés (si applicable)

## Screenshots
(si changements UI)
```

### 5. Review

- Répondre aux commentaires
- Effectuer les modifications demandées
- Demander une nouvelle review si nécessaire

### 6. Merge

Après approbation, la PR sera mergée par un mainteneur.

## 🐛 Reporting de bugs

### Template d'issue pour bugs

```markdown
## Description du bug
Description claire et concise

## Comment reproduire
1. Aller sur '...'
2. Cliquer sur '...'
3. Observer l'erreur

## Comportement attendu
Ce qui devrait se passer

## Comportement actuel
Ce qui se passe réellement

## Screenshots
(si applicable)

## Environnement
- OS: [ex: Ubuntu 22.04]
- Browser: [ex: Chrome 120]
- Version: [ex: 1.0.0]

## Logs
```
Coller les logs ici
```

## Informations additionnelles
Contexte additionnel
```

## ✨ Suggestions de fonctionnalités

### Template d'issue pour features

```markdown
## Problème à résoudre
Quel problème cette fonctionnalité résout-elle ?

## Solution proposée
Description de la solution

## Alternatives considérées
Autres approches possibles

## Informations additionnelles
Mockups, exemples, etc.
```

## 🎨 Guidelines UI/UX

### Design System

**Couleurs :**
```css
/* Primaires */
--purple: #9333EA
--pink: #EC4899
--blue: #3B82F6

/* Secondaires */
--green: #10B981
--yellow: #F59E0B
--red: #EF4444

/* Neutres */
--gray-50: #F9FAFB
--gray-800: #1F2937
```

**Espacements :**
- Petite marge : 4px, 8px
- Marge normale : 16px, 24px
- Grande marge : 32px, 48px

**Typographie :**
- Titres : font-black
- Sous-titres : font-bold
- Corps : font-normal

### Accessibilité

- Ratio de contraste minimum : 4.5:1
- Navigation au clavier fonctionnelle
- Labels ARIA appropriés
- Taille de texte minimum : 16px

## 📚 Ressources

### Documentation

- [React Docs](https://react.dev/)
- [Express Guide](https://expressjs.com/en/guide/routing.html)
- [Socket.io Docs](https://socket.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Outils recommandés

**VS Code Extensions :**
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- GitLens
- Docker

**Configuration Prettier :**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**Configuration ESLint :**
```json
{
  "extends": ["eslint:recommended", "plugin:react/recommended"],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error"
  }
}
```

## 🚀 Roadmap

### Fonctionnalités à venir

- [ ] Mode équipes
- [ ] Questions avec images
- [ ] Export des résultats
- [ ] Thèmes personnalisés
- [ ] API publique
- [ ] Application mobile
- [ ] Salle de chat
- [ ] Statistiques avancées

### Comment aider

Consultez les [issues](https://github.com/OWNER/quiz-app/issues) avec le label `good first issue` pour débuter.

## 💬 Communication

- **GitHub Issues** : Bugs et features
- **GitHub Discussions** : Questions générales
- **Discord** : Chat en temps réel (si disponible)
- **Email** : contact@example.com

## 📄 Licence

En contribuant, vous acceptez que vos contributions soient sous la même licence MIT que le projet.

## 🎉 Merci !

Merci pour votre contribution à QuizMaster ! Chaque contribution, qu'elle soit petite ou grande, fait une différence.

## 🏆 Contributeurs

Un grand merci à tous nos contributeurs ! Votre nom sera ajouté ici après votre première contribution mergée.

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- Généré automatiquement - NE PAS MODIFIER -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

## 📞 Contact

Pour toute question :
- Créer une [issue](https://github.com/OWNER/quiz-app/issues)
- Rejoindre les [discussions](https://github.com/OWNER/quiz-app/discussions)
- Email : contributors@example.com
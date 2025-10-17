# 🎮 QuizMaster - Application de Quiz Interactive

Application complète de quiz interactif type Kahoot avec temps réel, système de points et classements.

## ✨ Fonctionnalités

- ✅ Quiz avec questions à choix multiples et vrai/faux
- 👑 Interface d'administration complète
- 👥 Inscription et connexion des utilisateurs
- ⚡ Points basés sur la justesse ET le temps de réponse
- 🏆 Classement en direct avec podium
- 🎵 Musique de fond
- 🎨 Design coloré et fun
- 🔄 Temps réel avec WebSockets

## 🛠️ Technologies

**Backend:**
- Node.js + Express
- Socket.io (WebSockets)
- SQLite
- JWT pour l'authentification
- bcrypt pour les mots de passe

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Socket.io-client

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
├── backend/
│   ├── server.js          # Serveur principal
│   ├── package.json
│   └── quiz.db           # Base de données (créée auto)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Application principale
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
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

Tables:
- `users` - Utilisateurs et admins
- `quizzes` - Quiz créés
- `questions` - Questions des quiz
- `game_sessions` - Sessions de jeu en cours
- `scores` - Scores et statistiques

## 🎵 Musique

L'application utilise une musique libre de droits. Vous pouvez la remplacer dans le composant en modifiant l'URL de l'audio.

## 🚧 Améliorations possibles

- [ ] Chat en temps réel
- [ ] Statistiques détaillées
- [ ] Thèmes personnalisés
- [ ] Export des résultats
- [ ] Mode équipes
- [ ] Questions avec images
- [ ] Sauvegarde des parties
- [ ] Système de badges

## 📜 Licence

MIT

## 👨‍💻 Auteur

Créé avec ❤️ pour l'apprentissage interactif
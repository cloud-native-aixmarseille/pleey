---
sidebar_position: 2
---

# ⚡ QuizMaster - Démarrage ultra-rapide

## 🚀 Installation en 1 ligne

```bash
curl -fsSL https://raw.githubusercontent.com/OWNER/quiz-app/main/install.sh | bash
```

## 📋 OU Installation manuelle en 3 commandes

```bash
git clone <repo-url> && cd quiz-app
cp .env.example .env && sed -i "s/votre_secret_jwt/$(openssl rand -base64 32)/" .env
docker-compose up -d
```

## 🎮 Accès immédiat

- **Application** : http://localhost
- **Admin** : admin@quiz.com / admin123

## 🎯 Créer votre premier quiz

1. Connectez-vous en admin
2. Créez un quiz
3. Ajoutez des questions
4. Lancez une session → obtenez un PIN
5. Les joueurs rejoignent avec le PIN
6. Démarrez et amusez-vous !

## 🛠️ Commandes essentielles

```bash
make help      # Voir toutes les commandes
make logs      # Logs en direct
make restart   # Redémarrer
make backup    # Sauvegarder
```

## 📚 Documentation complète

- [Documentation Home](intro) - Guide complet
- [Quick Reference](../technical/quick-reference) - Toutes les commandes
- [Docker Guide](../technical/docker-guide) - Guide Docker
- [Deployment Checklist](../technical/deployment) - Déploiement production

## 🆘 Problème ?

```bash
make logs              # Voir les logs
docker-compose ps      # Vérifier les services
./test.sh             # Lancer les tests
```

## ✨ C'est tout !

QuizMaster est maintenant opérationnel. Bon quiz ! 🎉
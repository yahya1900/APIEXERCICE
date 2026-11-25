# Gestion des étudiants

Application React + Vite avec React Router et JSON Server.

## Prérequis
- Node.js installé
- npm

## Installation
Ouvrir un terminal dans le dossier du projet puis exécuter :

```bash
npm install
```

## Lancement
Ouvrir **deux terminaux** dans le dossier du projet.

Terminal 1 – démarrer l'API :
```bash
npm run api
```

Terminal 2 – démarrer React :
```bash
npm run dev
```

Ouvrir l'adresse affichée par Vite (généralement http://localhost:5173).

## Connexion de démonstration
- Email : admin@ecole.ma
- Mot de passe : admin123

## API
- GET http://localhost:3001/etudiants
- GET http://localhost:3001/etudiants/1
- POST http://localhost:3001/etudiants
- PUT http://localhost:3001/etudiants/1
- DELETE http://localhost:3001/etudiants/1

Les données sont enregistrées dans `db.json`.

## Build
```bash
npm run build
```

## Déploiement
Le site Vercel et l'API doivent être déployés séparément. JSON Server lancé avec `npm run api` fonctionne sur votre ordinateur, mais n'est pas inclus dans le site construit.

Pour créer l'API sur Render, créez un Blueprint à partir de ce dépôt et validez `render.yaml`. Après le déploiement, vérifiez les adresses `/users` et `/etudiants` sur l'URL Render du service.

Dans Vercel, définissez la variable `VITE_API_URL` avec l'URL publique Render, sans `/` à la fin, puis redéployez le site. L'exemple `.env.example` sert au développement local.

Le projet contient une règle de redirection des routes React pour Netlify et Vercel.

Limite de la version gratuite : le système de fichiers Render est temporaire. Les changements faits dans `db.json` peuvent être perdus quand le service s'arrête ou redémarre. Ce stockage sert aux démonstrations, pas à conserver durablement les données.

Note : l'authentification est une démonstration pédagogique côté client. Pour une vraie mise en production, il faut un backend sécurisé avec mots de passe hachés et gestion de sessions/tokens. JSON Server est destiné au développement et aux démonstrations.

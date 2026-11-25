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
Le site et l'API doivent être déployés séparément. JSON Server lancé avec `npm run api` fonctionne sur votre ordinateur, mais n'est pas inclus dans le site construit.

Sur la plateforme de déploiement du site, définissez la variable `VITE_API_URL` avec l'adresse publique de l'API, sans `/` à la fin. L'API doit fournir les routes `/users` et `/etudiants` utilisées par l'application. Un exemple de configuration locale se trouve dans `.env.example`.

Le projet contient une règle de redirection des routes React pour Netlify et Vercel.

Note : l'authentification est une démonstration pédagogique côté client. Pour une vraie mise en production, il faut un backend sécurisé avec mots de passe hachés et gestion de sessions/tokens. JSON Server est destiné au développement et aux démonstrations.

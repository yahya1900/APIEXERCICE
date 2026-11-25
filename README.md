# Gestion des étudiants

Application React + Vite pour consulter et gérer les dossiers étudiants, avec une API JSON Server.

## Installation locale

```powershell
npm install
Copy-Item .env.example .env
```

Modifiez `.env` avant le premier lancement : choisissez un mot de passe administrateur unique de 12 caractères minimum et remplacez `SESSION_SECRET` par une valeur aléatoire longue. Ne publiez jamais `.env` : il est ignoré par Git.

Pour générer un secret de session dans PowerShell :

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Ouvrez deux terminaux dans le dossier du projet :

```powershell
npm run api
```

```powershell
npm run dev
```

Ouvrez l’adresse donnée par Vite, généralement http://localhost:5173.

## Sécurité

- Aucun mot de passe administrateur n’est enregistré dans `db.json` ou dans le code du navigateur. Configurez `ADMIN_EMAIL` et `ADMIN_PASSWORD` comme variables d’environnement privées.
- La connexion crée une session signée dans un cookie `HttpOnly`; l’application ne garde pas de jeton d’accès dans `localStorage`.
- Les routes de gestion exigent une session, limitent les tentatives de connexion et valident les données reçues.
- Configurez `APP_ORIGINS` avec les origines exactes autorisées, séparées par des virgules. En local, gardez `http://localhost:5173`.
- JSON Server convient à une démonstration. Pour des données de production, utilisez une vraie base de données et un backend maintenu.

## Déploiement

Le site Vercel et l’API sont deux services séparés.

1. Dans Render, créez un Blueprint depuis ce dépôt et configurez les valeurs demandées par `render.yaml` : `ADMIN_EMAIL`, `ADMIN_PASSWORD` et `APP_ORIGINS`. La valeur `APP_ORIGINS` doit être l’origine Vercel complète, par exemple `https://mon-projet.vercel.app`, sans barre finale.
2. Dans Vercel, ajoutez `VITE_API_URL` avec l’URL publique Render, sans barre finale, puis redéployez le site.
3. Vérifiez `https://<api-render>/health` et `https://<api-render>/auth/session`. La première route doit répondre `200`; la seconde doit répondre `401` avant connexion.

L’URL `https://jsonplaceholder.typicode.com/users` sert des données utilisateur fictives et publiques, sans authentification ni routes pour les étudiants. Elle ne peut pas remplacer l’API de ce projet.

Le service Render gratuit utilise un système de fichiers temporaire : les modifications de `db.json` peuvent disparaître quand le service s’arrête ou redémarre. Utilisez un stockage persistant pour conserver les modifications.

## Build

```powershell
npm run build
```

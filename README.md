# EpiCodi

EpiCodi est une application web développée avec React et Vite, utilisant Tailwind CSS pour le style. Ce projet permet de gérer des playlists M3U, d'afficher des films, séries et chaînes TV, et d'interagir avec une base de données locale pour stocker des informations utilisateur.

## Fonctionnalités

- **Gestion de Playlists M3U** : Téléchargez et importez des fichiers M3U pour gérer vos médias.
- **Affichage de Contenus** : Parcourez et visionnez des films, séries et chaînes TV.
- **Base de Données Locale** : Utilisation d'IndexedDB pour stocker des données utilisateur telles que l'historique de visionnage et la liste de favoris.
- **Recommandations** : Obtenez des recommandations basées sur les médias consultés.
- **Personnalisation de Profil** : Changez votre avatar et gérez votre liste de favoris.

## Installation

1. Clonez le dépôt :   ```bash
   git clone https://github.com/votre-utilisateur/EpiCodi.git
   cd EpiCodi/codi   ```

2. Installez les dépendances :   ```bash
   npm install   ```

3. Démarrez le serveur de développement :   ```bash
   npm run vite:start   ```

4. Accédez à l'application via [http://localhost:3000](http://localhost:3000).

## Scripts Disponibles

- `npm run vite:start` : Démarre l'application en mode développement.
- `npm run vite:build` : Construit l'application pour la production.
- `npm run vite:preview` : Prévisualise l'application construite.

## Configuration

- **Vite** : Configuration du serveur et des plugins dans `vite.config.ts`.
- **Tailwind CSS** : Configuration des styles dans `tailwind.config.js`.

## Structure du Projet

- **src/pages** : Contient les pages principales de l'application comme `login`, `homepage`, `details`, `user`, et `searching`.
- **src/components** : Composants réutilisables de l'application.
- **public** : Fichiers statiques et manifestes.

## Dépendances Principales

- React
- Vite
- Tailwind CSS
- IndexedDB (via `idb`)

## Contribuer

Les contributions sont les bienvenues ! Veuillez soumettre une pull request ou ouvrir une issue pour discuter des changements que vous souhaitez apporter.

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

# Projet Bibliothèque

Application de suivi de lecture personnel (listes, notes, avis, statistiques), avec recherche de livres via l'API Google Books.

## Structure

```
backend/     API Express + TypeScript + Prisma (PostgreSQL)
frontend/    Next.js (App Router) + TypeScript
```

## Démarrage

### 1. Base de données

Créer une base PostgreSQL locale, puis dans `backend/` :

```bash
cp .env.example .env
# éditer DATABASE_URL dans .env
npm install
npm run prisma:migrate   # crée les tables à partir de prisma/schema.prisma
npm run prisma:seed      # remplit les critères de notation par défaut
npm run dev               # API sur http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev               # http://localhost:3000
```

## Modèle de données

Le schéma Prisma (`backend/prisma/schema.prisma`) implémente le MLD du projet, avec un ajustement :
un livre peut appartenir à **plusieurs listes en même temps** (à lire, en cours, lu, abandonné),
via la table `bibliotheque_statut`, plutôt qu'un champ `statut` unique sur `bibliotheque`.

## Epics (voir user stories complètes dans le cadrage du projet)

- **A** — Authentification et compte
- **B** — Recherche et fiche livre (Google Books API)
- **C** — Bibliothèque personnelle (listes)
- **D** — Notation & avis
- **E** — Profils & statistiques
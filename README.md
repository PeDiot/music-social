# Resound

Un mini réseau social pour la musique : poste les morceaux que tu écoutes avec une note, écoute des extraits de 30s, et découvre ce qu'écoutent les autres. UI inspirée d'Apple Music.

## Stack

- **Next.js 16** (App Router, React 19, Server Components + Server Actions)
- **TypeScript strict** + **Tailwind CSS v4**
- **PostgreSQL** + **Prisma 6**
- **Auth.js v5** (NextAuth beta) — credentials email/password
- **Deezer Public API** pour le catalogue + les extraits 30s (pas de clé requise)

## Prérequis

- **Node.js ≥ 20** (testé avec 22.x)
- **Docker** (ou un Postgres ≥ 14 local)

## Démarrage

```bash
# 1. Démarrer Postgres
docker compose up -d

# 2. Copier les variables d'env (et générer un AUTH_SECRET fort)
cp .env.example .env
npx auth secret  # remplace AUTH_SECRET dans .env par la valeur générée

# 3. Installer les deps + créer le schema en DB
npm install
npx prisma migrate dev --name init

# 4. Lancer le dev server
npm run dev
```

L'app tourne sur http://localhost:3000.

## Relancer après un reboot / une session

Une fois le setup initial fait, pour relancer l'app dans un nouveau terminal :

```bash
colima start                # ~30s — démarre le moteur Docker
docker compose up -d        # démarre Postgres
npm run dev                 # démarre le dev server (http://localhost:3000)
```

Pour stopper proprement :

```bash
# Ctrl+C dans le terminal de npm run dev
docker compose down         # stoppe Postgres (garde les données)
colima stop                 # stoppe le moteur Docker
```

> Note : si tu utilises Docker Desktop au lieu de Colima, remplace `colima start` / `colima stop` par l'ouverture / fermeture de l'app Docker Desktop.

## Comptes

Pas de seed pour le moment — crée un compte via `/signup`.

## Déploiement (Vercel + Neon)

L'app est prête pour Vercel. Postgres est fourni par **Neon** (Postgres serverless, free tier).

### 1. Pousser le code sur GitHub

```bash
# crée un repo vide sur github.com/new puis :
git remote add origin git@github.com:<ton-user>/music-social.git
git push -u origin main
```

### 2. Importer dans Vercel

- Va sur [vercel.com/new](https://vercel.com/new)
- "Import" ton repo GitHub
- Framework auto-détecté : **Next.js**
- **Ne déploie pas tout de suite** : clique "Environment Variables" et ajoute :
  - `AUTH_SECRET` = sortie de `openssl rand -base64 33`
  - (laisse `DATABASE_URL` et `DIRECT_URL` vides pour l'instant — Neon les ajoutera)
- Clique "Deploy" (le premier build échouera faute de DB — c'est normal)

### 3. Brancher Neon

- Dans le dashboard Vercel du projet → onglet **"Storage"** → "Create Database" → **Neon**
- Sélectionne la région la plus proche (ex: `eu-central-1`)
- Au niveau "Connect to project", coche bien `production`, `preview`, `development`
- Vercel injecte automatiquement `DATABASE_URL` (pooled) et `DIRECT_URL` (direct) dans les vars d'env

### 4. Re-déployer

- Onglet "Deployments" → "..." sur le dernier deployment → "Redeploy"
- Le build script `prisma migrate deploy && next build` va créer les tables `User` et `Post` automatiquement

### Accéder à la DB de prod en local

```bash
# Récupère les vars d'env Vercel
npx vercel env pull .env.production

# Browse la prod via Prisma Studio
DATABASE_URL=$(grep '^DATABASE_URL=' .env.production | cut -d '=' -f2- | tr -d '"') \
  npx prisma studio
```

⚠️ Pointer Prisma Studio sur la prod = tu peux **modifier des rows live**. Crée éventuellement un user Postgres en read-only dans la console Neon pour le browse quotidien.

## Architecture

```
app/
  (auth)/login         page de connexion
  (auth)/signup        inscription (Server Action + bcrypt)
  (app)/feed           feed chronologique (infinite scroll)
  (app)/post/new       publication d'un nouveau post
  (app)/profile/:user  profil + stats (top artistes/albums/morceaux)
  api/auth/...         handlers Auth.js
  api/deezer/search    proxy authentifié vers la recherche Deezer
  api/deezer/track/:id proxy authentifié vers le détail track
components/
  PostCard             carte du feed (cover, preview, note, review)
  RatingStars          notation 0.5 → 5 (lecture/édition)
  PreviewPlayer        bouton play/pause avec ring de progression
  MusicSearchCombobox  recherche live debounced (Deezer)
  Sidebar              navigation desktop + bottom nav mobile
  Avatar               avatar avec fallback initiales
  StatStrip            strip horizontal scrollable (top artistes/albums/tracks)
features/
  auth/actions         login/signup/logout (Server Actions)
  posts/actions        createPost (re-fetch Deezer côté serveur), pagination
  profile/stats        agrégations Prisma `groupBy`
  deezer/{client,types} wrapper Deezer (server-only) + types normalisés
lib/
  prisma               singleton Prisma Client
  auth                 config NextAuth (Credentials + Prisma adapter, JWT)
  audio-context        provider global pour la lecture audio (un seul preview à la fois)
  cn                   utilitaire `clsx` + `tailwind-merge`
middleware.ts          protège /feed, /profile, /post (redirige vers /login)
```

## Fonctionnalités V1

- [x] Inscription / connexion email + password
- [x] Feed chronologique avec infinite scroll
- [x] Création de post : recherche Deezer → preview 30s → note (½ étoiles) → review optionnelle
- [x] Lecture audio globale (un seul morceau à la fois, ring de progression)
- [x] Page profil avec stats top artistes / albums / morceaux + note moyenne
- [x] Mode sombre automatique (selon les prefs OS)
- [x] Responsive avec barre de navigation mobile fixe
- [x] Sécurité : tous les détails de track sont re-fetchés côté serveur avant insert

## Hors scope V1

- Personnalisation du feed (l'algo `recent` est en dur, le champ est prêt côté query pour V2)
- Likes, commentaires, follows
- Login OAuth Spotify (pour importer ses favoris)
- Recherche d'utilisateurs

## Notes de dev

- **Deezer** : le champ `preview` peut être `null` sur certains morceaux. La recherche grise ces résultats et la création de post les rejette côté serveur.
- **Cache Deezer** : 5 min sur la recherche, 1 h sur les détails track (`next: { revalidate }`).
- **Audio** : un seul `<audio>` global est créé via le `AudioProvider` pour garantir qu'un seul preview joue à la fois.
- **Prisma 6** : `prisma generate` est lancé via le hook `postinstall` quand tu installes les deps.

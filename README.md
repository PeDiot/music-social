# Resound

A small social network for music: post the tracks you're listening to with a rating, play 30s previews, and discover what others are listening to. Apple Music-inspired UI.

## Stack

- **Next.js 16** (App Router, React 19, Server Components + Server Actions)
- **TypeScript strict** + **Tailwind CSS v4**
- **PostgreSQL** + **Prisma 6**
- **Auth.js v5** (NextAuth beta) — email/password credentials
- **Deezer Public API** for the catalog and 30s previews (no API key required)

## Requirements

- **Node.js ≥ 20** (tested with 22.x)
- **Docker** (or a local Postgres ≥ 14)

## Getting started

```bash
# 1. Start Postgres
docker compose up -d

# 2. Copy env vars (and generate a strong AUTH_SECRET)
cp .env.example .env
npx auth secret  # replaces AUTH_SECRET in .env with a generated value

# 3. Install deps + create the DB schema
npm install
npx prisma migrate dev --name init

# 4. Start the dev server
npm run dev
```

The app runs on http://localhost:3000.

## Restart after a reboot or new session

Once the initial setup is done, to bring the app back up in a new terminal:

```bash
colima start                # ~30s — starts the Docker engine
docker compose up -d        # starts Postgres
npm run dev                 # starts the dev server (http://localhost:3000)
```

To stop cleanly:

```bash
# Ctrl+C in the terminal running npm run dev
docker compose down         # stops Postgres (data is preserved)
colima stop                 # stops the Docker engine
```

> Note: if you use Docker Desktop instead of Colima, replace `colima start` / `colima stop` with opening / quitting the Docker Desktop app.

## Accounts

No seed data yet — create an account via `/signup`.

## Deployment (Vercel + Neon)

The app is ready for Vercel. Postgres is provided by **Neon** (serverless Postgres, free tier).

### 1. Push the code to GitHub

```bash
# create an empty repo at github.com/new, then:
git remote add origin git@github.com:<your-user>/music-social.git
git push -u origin main
```

### 2. Import into Vercel

- Go to [vercel.com/new](https://vercel.com/new)
- Click "Import" next to your GitHub repo
- Framework auto-detected: **Next.js**
- **Don't deploy yet**: open "Environment Variables" and add:
  - `AUTH_SECRET` = output of `openssl rand -base64 33`
  - (leave `DATABASE_URL` and `DIRECT_URL` empty for now — Neon will add them)
- Click "Deploy" (the first build will fail because there's no DB — this is expected)

### 3. Plug in Neon

- In the Vercel project dashboard → **Storage** tab → "Create Database" → **Neon**
- Pick the closest region (e.g. `eu-central-1`)
- Under "Connect to project", make sure `production`, `preview`, and `development` are all checked
- Vercel will automatically inject `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) into the project's env vars

### 4. Redeploy

- "Deployments" tab → "..." menu on the latest deployment → "Redeploy"
- The build script `prisma migrate deploy && next build` will create the `User` and `Post` tables automatically

### Inspect the prod DB locally

```bash
# Pull Vercel env vars locally
npx vercel env pull .env.production

# Browse prod via Prisma Studio
DATABASE_URL=$(grep '^DATABASE_URL=' .env.production | cut -d '=' -f2- | tr -d '"') \
  npx prisma studio
```

⚠️ Pointing Prisma Studio at production means you can **edit live rows**. Consider creating a read-only Postgres user in the Neon console for routine browsing.

## Architecture

```
app/
  (auth)/login         login page
  (auth)/signup        signup (Server Action + bcrypt)
  (app)/feed           chronological feed (infinite scroll)
  (app)/post/new       publish a new post
  (app)/profile/:user  profile + stats (top artists / albums / tracks)
  api/auth/...         Auth.js handlers
  api/deezer/search    authenticated proxy to Deezer search
  api/deezer/track/:id authenticated proxy to Deezer track lookup
components/
  PostCard             feed card (cover, preview, rating, review)
  RatingStars          rating 0.5 → 5 (read / edit)
  PreviewPlayer        play/pause button with progress ring
  MusicSearchCombobox  live debounced search (Deezer)
  Sidebar              desktop nav + mobile bottom nav
  Avatar               avatar with initials fallback
  StatStrip            horizontally scrollable strip (top artists / albums / tracks)
features/
  auth/actions         login / signup / logout (Server Actions)
  posts/actions        createPost (re-fetches Deezer server-side), pagination
  profile/stats        Prisma `groupBy` aggregations
  deezer/{client,types} server-only Deezer wrapper + normalized types
lib/
  prisma               Prisma Client singleton
  auth                 NextAuth config (Credentials + Prisma adapter, JWT)
  audio-context        global provider for audio playback (one preview at a time)
  cn                   `clsx` + `tailwind-merge` helper
proxy.ts               protects /feed, /profile, /post (redirects to /login)
```

## V1 features

- [x] Email + password signup / login
- [x] Chronological feed with infinite scroll
- [x] Post creation: Deezer search → 30s preview → rating (½ stars) → optional review
- [x] Global audio playback (only one track at a time, with progress ring)
- [x] Profile page with top artists / albums / tracks + average rating
- [x] Automatic dark mode (follows OS preference)
- [x] Responsive layout with a fixed mobile bottom nav
- [x] Security: every track detail is re-fetched server-side before insert

## Out of scope for V1

- Personalized feed algorithm (the `recent` algo is hardcoded; the field is ready in the query layer for V2)
- Likes, comments, follows
- Spotify OAuth login (to import favorites)
- User search

## Dev notes

- **Deezer**: the `preview` field can be `null` on some tracks. The search greys these results out and post creation rejects them server-side.
- **Deezer cache**: 5 min on search, 1 h on track detail (`next: { revalidate }`).
- **Audio**: a single global `<audio>` element is created via the `AudioProvider` to guarantee only one preview plays at a time.
- **Prisma 6**: `prisma generate` runs via the `postinstall` hook when you install deps.

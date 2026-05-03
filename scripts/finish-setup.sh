#!/usr/bin/env bash
# Auto-finish setup: ensures Docker daemon is up (Colima or Docker Desktop),
# starts Postgres, runs migrations, starts dev server.
# Idempotent: safe to re-run.

set -euo pipefail

export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/opt/homebrew/sbin:$PATH"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

log() { printf "\033[1;36m[setup]\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m[setup]\033[0m %s\n" "$*"; }
err() { printf "\033[1;31m[setup]\033[0m %s\n" "$*" >&2; }

# 1. Ensure Docker daemon is reachable (Colima preferred, Docker Desktop fallback)
if ! docker info > /dev/null 2>&1; then
  if command -v colima > /dev/null 2>&1; then
    log "Starting Colima (Docker daemon)..."
    colima start --cpu 2 --memory 4 --disk 20
  elif [ -d "/Applications/Docker.app" ]; then
    log "Launching Docker Desktop..."
    open -a Docker
    log "Waiting for Docker daemon..."
    for i in {1..120}; do
      if docker info > /dev/null 2>&1; then break; fi
      sleep 3
      [ "$i" -eq 120 ] && { err "Docker daemon not responding."; exit 1; }
    done
  else
    err "No Docker found. Install Colima: brew install colima docker docker-compose"
    exit 1
  fi
fi
log "Docker daemon: OK"

# 2. Ensure node_modules + Prisma client
if [ ! -d "node_modules" ] || [ ! -d "node_modules/@prisma/client" ]; then
  log "Installing npm dependencies..."
  npm install
fi
log "Generating Prisma client..."
npx prisma generate > /dev/null

# 3. Start Postgres
log "Starting Postgres container..."
docker compose up -d

log "Waiting for Postgres to accept connections..."
for i in {1..60}; do
  if docker exec music-social-db pg_isready -U music -d music_social > /dev/null 2>&1; then
    log "Postgres is ready."
    break
  fi
  sleep 2
  [ "$i" -eq 60 ] && { err "Postgres not ready after 2 minutes."; exit 1; }
done

# 4. Apply migrations (creates tables on first run)
log "Applying Prisma migrations..."
if [ -d "prisma/migrations" ] && [ -n "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  npx prisma migrate deploy 2>&1 | tail -10
else
  npx prisma migrate dev --name init --skip-seed --skip-generate
fi

# 5. Start dev server in background
if [ -f .logs/dev.pid ] && kill -0 "$(cat .logs/dev.pid)" 2>/dev/null; then
  warn "Dev server already running (PID $(cat .logs/dev.pid))."
else
  log "Starting Next.js dev server..."
  mkdir -p .logs
  nohup npm run dev > .logs/dev.log 2>&1 &
  echo $! > .logs/dev.pid
  log "Dev server PID: $(cat .logs/dev.pid) (logs: .logs/dev.log)"
fi

# 6. Wait for HTTP response
log "Waiting for HTTP on http://localhost:3000 ..."
for i in {1..60}; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
  if [[ "$code" =~ ^(200|301|302|307|308)$ ]]; then
    log "App is live → http://localhost:3000  (HTTP $code)"
    log "    Stop with: kill \$(cat .logs/dev.pid) && docker compose down"
    exit 0
  fi
  sleep 2
done

warn "Server didn't respond in 2 min. Check logs: tail -f .logs/dev.log"
exit 1

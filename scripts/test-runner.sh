#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"
BACKEND_HEALTH_PATH="${BACKEND_HEALTH_PATH:-/api/health}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost}"
MAX_WAIT_TIME="${MAX_WAIT_TIME:-60}"
POLL_INTERVAL="${POLL_INTERVAL:-2}"

log() {
  echo "[tests] $*"
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

container_running() {
  docker ps --format '{{.Names}}' | grep -Fxq "$1"
}

ensure_stack() {
  if ! command_exists docker; then
    echo "docker is required for E2E tests" >&2
    exit 1
  fi

  local needs_start=0
  if ! container_running "quiz-backend" || ! container_running "quiz-frontend"; then
    needs_start=1
  fi

  if (( needs_start )); then
    log "Starting docker compose stack..."
    (cd "$ROOT_DIR" && docker compose up -d)
    sleep 5
  fi
}

join_url() {
  local base="$1"
  local path="$2"
  if [[ "$base" == */ && "$path" == /* ]]; then
    printf '%s%s' "${base%/}" "$path"
  elif [[ "$base" != */ && "$path" != /* ]]; then
    printf '%s/%s' "$base" "$path"
  else
    printf '%s%s' "$base" "$path"
  fi
}

wait_for_http() {
  local url="$1"
  local name="$2"
  local elapsed=0

  log "Waiting for $name ($url)..."
  while (( elapsed < MAX_WAIT_TIME )); do
    if curl -sf "$url" >/dev/null; then
      log "$name ready"
      return 0
    fi
    sleep "$POLL_INTERVAL"
    elapsed=$((elapsed + POLL_INTERVAL))
  done

  echo "${name^} did not become ready in ${MAX_WAIT_TIME}s" >&2
  exit 1
}

run_backend() {
  local mode="${1:-}";
  (cd "$ROOT_DIR/backend" && case "$mode" in
    --watch) npm run test:watch ;;
    --coverage|--cov) npm run test:cov ;;
    '' ) npm test ;;
    *) echo "Unknown backend option: $mode" >&2; exit 1 ;;
  esac)
}

run_frontend() {
  local mode="${1:-}";
  (cd "$ROOT_DIR/frontend" && case "$mode" in
    --watch) npm run test:watch ;;
    --coverage|--cov) npm run test:cov ;;
    '' ) npm test ;;
    *) echo "Unknown frontend option: $mode" >&2; exit 1 ;;
  esac)
}

run_e2e() {
  local mode="${1:-all}"
  ensure_stack
  wait_for_http "$(join_url "$BACKEND_URL" "$BACKEND_HEALTH_PATH")" "backend"
  wait_for_http "$FRONTEND_URL" "frontend"

  (cd "$ROOT_DIR/e2e" && case "$mode" in
    smoke) npm run test:smoke ;;
    ui) npm run test:ui ;;
    debug) npm run test:debug ;;
    headed) npm run test:headed ;;
    all|'') npm test ;;
    *) echo "Unknown e2e mode: $mode" >&2; exit 1 ;;
  esac)
}

run_all() {
  run_backend
  run_frontend
  run_e2e
}

run_coverage() {
  run_backend --coverage
  run_frontend --coverage
}

usage() {
  cat <<'EOF'
Usage: ./scripts/test-runner.sh [command] [options]

Commands:
  backend [--watch|--coverage]   Run backend tests (default: unit tests)
  frontend [--watch|--coverage]  Run frontend tests (default: unit tests)
  e2e [mode]                     Run Playwright tests (modes: all, smoke, ui, debug, headed)
  all                            Run backend, frontend, then all e2e tests
  coverage                       Run backend and frontend coverage suites
  help                           Show this message

Examples:
  ./scripts/test-runner.sh backend --watch
  ./scripts/test-runner.sh frontend --coverage
  ./scripts/test-runner.sh e2e smoke
  ./scripts/test-runner.sh all
EOF
}

main() {
  local command="${1:-all}"

  case "$command" in
    backend) run_backend "${2:-}" ;;
    frontend) run_frontend "${2:-}" ;;
    e2e) run_e2e "${2:-all}" ;;
    smoke) run_e2e smoke ;;
    all) run_all ;;
    coverage|cov) run_coverage ;;
    help|--help|-h) usage ;;
    *) echo "Unknown command: $command" >&2; usage; exit 1 ;;
  esac
}

main "$@"

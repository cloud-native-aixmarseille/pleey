#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_HEALTH_PATH="${BACKEND_HEALTH_PATH:-/ready}"
MAX_WAIT_TIME="${MAX_WAIT_TIME:-60}"
POLL_INTERVAL="${POLL_INTERVAL:-2}"
VITE_API_URL_E2E="${VITE_API_URL_E2E:-http://backend:3001}"

log() {
	echo "[tests] $*"
}

command_exists() {
	command -v "$1" >/dev/null 2>&1
}

ensure_stack() {
	if ! command_exists docker; then
		echo "docker is required for E2E tests" >&2
		exit 1
	fi

	log "Ensuring docker compose stack is running..."
	(cd "$ROOT_DIR" && VITE_API_URL="$VITE_API_URL_E2E" docker compose --env-file /dev/null up -d postgres otel-collector)
	(cd "$ROOT_DIR" && VITE_API_URL="$VITE_API_URL_E2E" docker compose --env-file /dev/null up -d --force-recreate backend)
	(cd "$ROOT_DIR" && VITE_API_URL="$VITE_API_URL_E2E" docker compose --env-file /dev/null up -d --force-recreate frontend)
}

wait_for_http() {
	local url="$1"
	local name="$2"
	local elapsed=0

	log "Waiting for $name ($url)..."
	while ((elapsed < MAX_WAIT_TIME)); do
		if (cd "$ROOT_DIR" && VITE_API_URL="$VITE_API_URL_E2E" docker compose --env-file /dev/null run --rm --no-deps -T e2e-tests curl -sf "$url" >/dev/null); then
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
	local mode="${1:-}"
	(cd "$ROOT_DIR/application/backend" && case "$mode" in
	--watch) npm run test:watch ;;
	--coverage | --cov) npm run test:cov ;;
	'') npm test ;;
	*)
		echo "Unknown backend option: $mode" >&2
		exit 1
		;;
	esac)
}

run_frontend() {
	local mode="${1:-}"
	(cd "$ROOT_DIR/application/frontend" && case "$mode" in
	--watch) npm run test:watch ;;
	--coverage | --cov) npm run test:cov ;;
	'') npm test ;;
	*)
		echo "Unknown frontend option: $mode" >&2
		exit 1
		;;
	esac)
}

run_e2e() {
	local mode="${1:-all}"
	ensure_stack
	wait_for_http "http://backend:3001${BACKEND_HEALTH_PATH}" "backend"

	log "Flushing Valkey session state..."
	(cd "$ROOT_DIR" && VITE_API_URL="$VITE_API_URL_E2E" docker compose --env-file /dev/null exec -T valkey valkey-cli FLUSHALL >/dev/null)

	log "Resetting database + seed data..."
	# E2E runs must start from the current Prisma schema so seeded fixtures stay
	# deterministic even when the checked-in migration history lags schema-level
	# refactors like UUID-backed identifiers.
	(cd "$ROOT_DIR" && VITE_API_URL="$VITE_API_URL_E2E" docker compose --env-file /dev/null exec -T backend sh -lc 'npx prisma db push --force-reset && npm run db:generate && NODE_NO_WARNINGS=1 npm run seed')

	wait_for_http "http://backend:3001${BACKEND_HEALTH_PATH}" "backend"

	wait_for_http "http://frontend:5173" "frontend"

	local script_cmd
	case "$mode" in
	smoke) script_cmd="test:smoke" ;;
	ui) script_cmd="test:ui" ;;
	debug) script_cmd="test:debug" ;;
	headed) script_cmd="test:headed" ;;
	all | '') script_cmd="test" ;;
	*)
		echo "Unknown e2e mode: $mode" >&2
		exit 1
		;;
	esac

	(cd "$ROOT_DIR" && VITE_API_URL="$VITE_API_URL_E2E" docker compose --env-file /dev/null run --rm -T \
		-e BASE_URL="${BASE_URL:-http://frontend:5173}" \
		-e API_BASE_URL="${API_BASE_URL:-http://backend:3001/api}" \
		-e E2E_ADMIN_EMAIL="${E2E_ADMIN_EMAIL:-admin@pleey.com}" \
		-e E2E_ADMIN_PASSWORD="${E2E_ADMIN_PASSWORD:-admin123}" \
		-e E2E_PLAYER_EMAIL="${E2E_PLAYER_EMAIL:-player@pleey.com}" \
		-e E2E_PLAYER_PASSWORD="${E2E_PLAYER_PASSWORD:-player123}" \
		e2e-tests bash -lc "NPM_CONFIG_LOGLEVEL=error NPM_CONFIG_UPDATE_NOTIFIER=false npm ci --no-audit --fund=false && NPM_CONFIG_LOGLEVEL=error NPM_CONFIG_UPDATE_NOTIFIER=false npm run '$script_cmd'")
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
	coverage | cov) run_coverage ;;
	help | --help | -h) usage ;;
	*)
		echo "Unknown command: $command" >&2
		usage
		exit 1
		;;
	esac
}

main "$@"

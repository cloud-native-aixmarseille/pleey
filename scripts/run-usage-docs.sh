#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
mode="${1:-check}"
case "$mode" in
capture) capture=1 ;;
check) capture=0 ;;
*)
	echo 'Usage: scripts/run-usage-docs.sh [capture|check]' >&2
	exit 2
	;;
esac
# Never reset the developer stack. All database/cache/media volumes belong to this invocation.
project="pleey-usage-$(date +%s)-$RANDOM"
export COMPOSE_PROJECT_NAME="$project"
mkdir -p .cache/usage-docs
usage_work_directory="$(mktemp -d "$PWD/.cache/usage-docs/run.XXXXXXXX")"
export USAGE_WORK_DIRECTORY="$usage_work_directory"
USAGE_UID="$(id -u)"
USAGE_GID="$(id -g)"
export USAGE_UID
export USAGE_GID
mkdir -p "$usage_work_directory/tmp" "$usage_work_directory/npm"
compose=(docker compose --env-file /dev/null -p "$project" -f compose.yaml -f e2e/compose.usage.yaml)
cleanup() {
	status=$?
	if ((status != 0)); then "${compose[@]}" logs --tail=45 backend frontend; fi
	if "${compose[@]}" down --volumes --remove-orphans; then
		rm -rf -- "$usage_work_directory"
	else
		echo "Cleanup failed for $project. Retained $usage_work_directory." >&2
		return 1
	fi
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
"${compose[@]}" up -d --no-build --wait --wait-timeout 180 backend frontend
"${compose[@]}" run --rm --no-deps -T -e USAGE_CAPTURE="$capture" e2e-tests npm run docs:screenshots

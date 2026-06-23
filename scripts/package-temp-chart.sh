#!/usr/bin/env bash

set -euo pipefail

require_env() {
	local variable_name="$1"

	if [[ -z "${!variable_name:-}" ]]; then
		printf 'Missing required environment variable: %s\n' "$variable_name" >&2
		exit 1
	fi
}

require_env "BACKEND_IMAGE_REPOSITORY"
require_env "BACKEND_IMAGE_TAG"
require_env "BACKEND_IMAGE_DIGEST"
require_env "FRONTEND_IMAGE_REPOSITORY"
require_env "FRONTEND_IMAGE_TAG"
require_env "FRONTEND_IMAGE_DIGEST"
require_env "TEMP_CHART_VERSION"
require_env "TEMP_APP_VERSION"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"
source_chart_dir="${CHART_SOURCE_DIR:-${repo_root}/charts/application}"
chart_temp_root="${CHART_TEMP_ROOT:-$(mktemp -d "${RUNNER_TEMP:-/tmp}/pleey-demo-chart.XXXXXX")}"
chart_output_dir="${CHART_OUTPUT_DIR:-${chart_temp_root}/packages}"
chart_copy_dir="${chart_temp_root}/application"

mkdir -p "$chart_output_dir"
rm -rf "$chart_copy_dir"
cp -R "$source_chart_dir" "$chart_copy_dir"

helm repo add cloudnative-pg https://cloudnative-pg.github.io/charts >/dev/null
helm repo add valkey https://valkey.io/valkey-helm/ >/dev/null
helm dependency build "$chart_copy_dir/charts/backend" >/dev/null

TMP_CHART_DIR="$chart_copy_dir" ruby <<'RUBY'
require "yaml"

def load_yaml(path)
  YAML.load_file(path)
end

def write_yaml(path, content)
  serialized = YAML.dump(content).sub(/\A---\s*\n/, "")
  File.write(path, serialized)
end

chart_dir = ENV.fetch("TMP_CHART_DIR")
temp_chart_version = ENV.fetch("TEMP_CHART_VERSION")
temp_app_version = ENV.fetch("TEMP_APP_VERSION")
backend_repository = ENV.fetch("BACKEND_IMAGE_REPOSITORY")
backend_tag = ENV.fetch("BACKEND_IMAGE_TAG")
backend_digest = ENV.fetch("BACKEND_IMAGE_DIGEST")
frontend_repository = ENV.fetch("FRONTEND_IMAGE_REPOSITORY")
frontend_tag = ENV.fetch("FRONTEND_IMAGE_TAG")
frontend_digest = ENV.fetch("FRONTEND_IMAGE_DIGEST")

root_chart_path = File.join(chart_dir, "Chart.yaml")
backend_chart_path = File.join(chart_dir, "charts", "backend", "Chart.yaml")
frontend_chart_path = File.join(chart_dir, "charts", "frontend", "Chart.yaml")
backend_values_path = File.join(chart_dir, "charts", "backend", "values.yaml")
frontend_values_path = File.join(chart_dir, "charts", "frontend", "values.yaml")

root_chart = load_yaml(root_chart_path)
root_chart["version"] = temp_chart_version
root_chart["appVersion"] = temp_app_version
root_chart.fetch("dependencies").each do |dependency|
  next unless ["backend", "frontend"].include?(dependency["name"])

  dependency["version"] = temp_chart_version
end
write_yaml(root_chart_path, root_chart)

backend_chart = load_yaml(backend_chart_path)
backend_chart["version"] = temp_chart_version
backend_chart["appVersion"] = temp_app_version
write_yaml(backend_chart_path, backend_chart)

frontend_chart = load_yaml(frontend_chart_path)
frontend_chart["version"] = temp_chart_version
frontend_chart["appVersion"] = temp_app_version
write_yaml(frontend_chart_path, frontend_chart)

backend_values = load_yaml(backend_values_path)
backend_values.fetch("image")["registry"] = ""
backend_values.fetch("image")["repository"] = backend_repository
backend_values.fetch("image")["tag"] = backend_tag
backend_values.fetch("image")["digest"] = backend_digest
write_yaml(backend_values_path, backend_values)

frontend_values = load_yaml(frontend_values_path)
frontend_values.fetch("image")["registry"] = ""
frontend_values.fetch("image")["repository"] = frontend_repository
frontend_values.fetch("image")["tag"] = frontend_tag
frontend_values.fetch("image")["digest"] = frontend_digest
write_yaml(frontend_values_path, frontend_values)
RUBY

helm dependency update "$chart_copy_dir" >/dev/null

chart_archive="$(helm package "$chart_copy_dir" --destination "$chart_output_dir" | sed -n 's/^Successfully packaged chart and saved it to: //p')"

if [[ -z "$chart_archive" ]]; then
	printf 'Unable to determine packaged chart path\n' >&2
	exit 1
fi

printf 'Packaged temp chart at %s\n' "$chart_archive"

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
	printf 'chart_archive=%s\n' "$chart_archive" >>"$GITHUB_OUTPUT"
fi

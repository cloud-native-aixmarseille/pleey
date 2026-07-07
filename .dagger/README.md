# Dagger Module Usage

This folder contains the local TypeScript Dagger module used by the CI pipeline.

The current module name is `pleey-demo-ci` and it exposes these callable functions:

- `prepare-temp-artifacts`: computes the backend/frontend image repositories, chart repository, image tag, and chart version.
- `lint-and-test-backend`: builds the backend `ci` target and runs `npm run lint:ci` then `npm run test:ci`.
- `lint-and-test-frontend`: builds the frontend `ci` target and runs `npm run lint:ci` then `npm run test:ci`.
- `publish-backend-image`: builds and publishes the backend `prod` image, returning its published reference and digest.
- `publish-frontend-image`: builds and publishes the frontend `prod` image, returning its published reference and digest.
- `release-temp-chart`: packages and publishes the Helm chart using the published backend/frontend image digests.
- `demo-dispatch`: convenience entrypoint that runs the full sequence above.

## Source vs generated files

Commit these files:

- `src/index.ts`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `.gitignore`
- `.gitattributes`

Do not commit generated files:

- `sdk/**`
- `node_modules/**`

Those generated paths are intentionally ignored by `.dagger/.gitignore`.

## Prerequisites

- Dagger CLI installed
- Node.js available for the TypeScript module runtime
- GitHub CLI (`gh`) installed and authenticated, or another registry credential that can push images and Helm charts
- A GitHub token with package publish permission for the target registry path. For GHCR, the token used by `gh auth token` must include `write:packages`.
- Access to the target OCI registry
- Docker/BuildKit support available to the Dagger engine

## Inspect the module

From the repository root:

```bash
dagger functions
```

You should see the functions above in the function list.

## Local usage

Set the target registry, then authenticate `gh` with package publish scope before exporting the token for Dagger:

```bash
# First-time login
gh auth login --hostname github.com --web --scopes write:packages

# Or add the scope to an existing login
gh auth refresh -h github.com -s write:packages

gh auth status -t
```

The active token should list `write:packages` before you continue.

Then export the GitHub registry credentials into the current shell before calling Dagger:

```bash
export OCI_REGISTRY=ghcr.io
export GITHUB_TOKEN="$(gh auth token)"

dagger call demo-dispatch \
  --source=. \
  --oci-registry="$OCI_REGISTRY" \
  --registry-username="$(gh api user --jq '.login')" \
  --registry-password=env://GITHUB_TOKEN \
  --repository="cloud-native-aixmarseille/pleey" \
  --run-number="0" \
  --run-attempt="0" \
  --git-sha="$(git rev-parse HEAD)"
```

Using an inline `GITHUB_TOKEN=... dagger call ...` assignment can leave `env://GITHUB_TOKEN` unresolved in local runs. Export the token first so the Dagger CLI can read it when resolving the secret.

If GHCR returns `403 Forbidden` with `The token provided does not match expected scopes.`, your active GitHub CLI token is still missing package publish scope. Re-run:

```bash
gh auth refresh -h github.com -s write:packages
gh auth status -t
```

The function returns a short Markdown summary containing:

- the published backend image tag
- the published frontend image tag
- the published Helm chart version

## What the function does

`demo-dispatch` performs these steps:

1. Build the backend `ci` target and run `npm run lint:ci` and `npm run test:ci`.
2. Build the frontend `ci` target and run `npm run lint:ci` and `npm run test:ci`.
3. Build and publish `prod` backend and frontend images for `linux/amd64`.
4. Run `scripts/package-temp-chart.sh` inside a Helm tooling container.
5. Push the chart to the OCI chart repository.

Demo artifacts are isolated under `demo/` registry paths and use demo-only tags and chart versions.

## GitHub Actions usage

The dedicated workflow that calls this module is [.github/workflows/demo-dispatch-dagger-ci.yml](../.github/workflows/demo-dispatch-dagger-ci.yml).

That workflow now mirrors the job layout of [.github/workflows/demo-dispatch-ci.yml](../.github/workflows/demo-dispatch-ci.yml) with separate `prepare-temp-metadata`, `lint-and-test`, `build-temp-images`, and `release-temp-chart` jobs. Inside those jobs it invokes the exported Dagger stages. For example:

```bash
dagger call prepare-temp-artifacts \
  --oci-registry='${{ vars.OCI_REGISTRY }}' \
  --repository='${{ github.repository }}' \
  --run-number='${{ github.run_number }}' \
  --run-attempt='${{ github.run_attempt }}' \
  --git-sha='${{ github.sha }}'

dagger call publish-backend-image \
  --source=. \
  --oci-registry='${{ vars.OCI_REGISTRY }}' \
  --registry-username='${{ github.actor }}' \
  --registry-password=env://GITHUB_TOKEN \
  --repository='${{ github.repository }}' \
  --run-number='${{ github.run_number }}' \
  --run-attempt='${{ github.run_attempt }}' \
  --git-sha='${{ github.sha }}'
```

`prepare-temp-artifacts`, `publish-backend-image`, and `publish-frontend-image` return raw JSON strings. The workflow extracts their fields in shell steps with `jq` and then promotes those plain scalar values to job outputs.

## Performance and caching

- Each public Dagger function now filters its `source` directory down to only the files needed by that stage. That keeps unrelated repository changes from invalidating backend, frontend, or chart caches.
- The split-job GitHub Actions workflow still benefits from Dagger layer reuse within each invocation, but it does not depend on any Dagger Cloud feature.
- For local runs, repeated calls benefit most when the relevant backend, frontend, or chart inputs stay unchanged because the filtered `source` arguments avoid invalidating unrelated files.

## Notes

- The module currently assumes the repository layout used by Pleey, especially `application/backend`, `application/frontend`, and `charts/application`.
- The chart packaging logic is delegated to [scripts/package-temp-chart.sh](../scripts/package-temp-chart.sh).
- If the registry credential cannot push both OCI images and OCI charts, the function will fail during publish.

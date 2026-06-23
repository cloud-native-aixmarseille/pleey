# Dagger Module Usage

This folder contains the local TypeScript Dagger module used by the demo CI pipeline.

The current module name is `pleey-demo-ci` and it exposes one callable function:

- `demo-dispatch`: runs backend/frontend lint and tests, publishes temporary backend/frontend images, then packages and publishes a temporary Helm chart.

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

You should see `demo-dispatch` in the function list.

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

- the published temporary backend image reference
- the published temporary frontend image reference
- the published temporary Helm chart reference

## What the function does

`demo-dispatch` performs these steps:

1. Build the backend `ci` target and run `npm run lint:ci` and `npm run test:ci`.
2. Build the frontend `ci` target and run `npm run lint:ci` and `npm run test:ci`.
3. Build and publish temporary `prod` backend and frontend images for `linux/amd64`.
4. Run `scripts/package-temp-chart.sh` inside a Helm tooling container.
5. Push the temporary chart to the OCI chart repository.

Temporary artifacts are isolated under `tmp/` registry paths and use demo-only tags and chart versions.

## GitHub Actions usage

The dedicated workflow that calls this module is [.github/workflows/demo-dispatch-dagger-ci.yml](../.github/workflows/demo-dispatch-dagger-ci.yml).

That workflow passes GitHub runtime values into `demo-dispatch` like this:

```bash
dagger call demo-dispatch \
  --source=. \
  --oci-registry='${{ vars.OCI_REGISTRY }}' \
  --registry-username='${{ github.repository_owner }}' \
  --registry-password=env://GITHUB_TOKEN \
  --repository='${{ github.repository }}' \
  --run-number='${{ github.run_number }}' \
  --run-attempt='${{ github.run_attempt }}' \
  --git-sha='${{ github.sha }}'
```

## Notes

- The module currently assumes the repository layout used by Pleey, especially `application/backend`, `application/frontend`, and `charts/application`.
- The chart packaging logic is delegated to [scripts/package-temp-chart.sh](../scripts/package-temp-chart.sh).
- If the registry credential cannot push both OCI images and OCI charts, the function will fail during publish.

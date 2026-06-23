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
- Access to the target OCI registry
- A registry credential that can push images and Helm charts
- Docker/BuildKit support available to the Dagger engine

## Inspect the module

From the repository root:

```bash
dagger functions
```

You should see `demo-dispatch` in the function list.

## Local usage

Set the required environment variables first:

```bash
export OCI_REGISTRY=ghcr.io
export REGISTRY_USERNAME=<registry-username>
export GITHUB_TOKEN=<registry-token>
```

Then run the module from the repository root:

```bash
dagger call demo-dispatch \
  --source=. \
  --oci-registry="$OCI_REGISTRY" \
  --registry-username="$REGISTRY_USERNAME" \
  --registry-password=env://GITHUB_TOKEN \
  --repository="cloud-native-aixmarseille/pleey" \
  --run-number="0" \
  --run-attempt="0" \
  --git-sha="$(git rev-parse HEAD)"
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

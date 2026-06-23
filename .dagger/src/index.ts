import { dag, Directory, object, func, Secret } from "@dagger.io/dagger"

const REPOSITORY_ROOT_PATH = "/src"
const CHART_TEMP_ROOT_PATH = "/tmp/pleey-demo-chart"
const LINUX_AMD64 = "linux/amd64"

type TempArtifacts = {
  backendImageRepository: string
  frontendImageRepository: string
  chartRepository: string
  imageTag: string
  chartVersion: string
}

type PublishedImage = {
  reference: string
  digest: string
}

@object()
export class PleeyDemoCi {
  /**
   * Runs standalone demo CI with lint, tests, temp image publication, and temp chart publication.
   */
  @func()
  async demoDispatch(
    source: Directory,
    ociRegistry: string,
    registryUsername: string,
    registryPassword: Secret,
    repository: string,
    runNumber: string,
    runAttempt: string,
    gitSha: string,
  ): Promise<string> {
    const artifacts = this.newTempArtifacts(
      ociRegistry,
      repository,
      runNumber,
      runAttempt,
      gitSha,
    )

    await this.lintAndTestService(source, "backend")
    await this.lintAndTestService(source, "frontend")

    const backendImage = await this.publishImage(
      source,
      ociRegistry,
      registryUsername,
      registryPassword,
      "application/backend/Dockerfile",
      artifacts.backendImageRepository,
      artifacts.imageTag,
    )

    const frontendImage = await this.publishImage(
      source,
      ociRegistry,
      registryUsername,
      registryPassword,
      "application/frontend/Dockerfile",
      artifacts.frontendImageRepository,
      artifacts.imageTag,
    )

    const chartReference = await this.releaseTempChart(
      source,
      artifacts,
      ociRegistry,
      registryUsername,
      registryPassword,
      backendImage.digest,
      frontendImage.digest,
    )

    return [
      "## Temp demo artifacts",
      "",
      `- Backend image: ${backendImage.reference}`,
      `- Frontend image: ${frontendImage.reference}`,
      `- Helm chart: ${chartReference}`,
    ].join("\n")
  }

  private async lintAndTestService(
    source: Directory,
    service: string,
  ): Promise<void> {
    const ciContainer = source.dockerBuild({
      dockerfile: `application/${service}/Dockerfile`,
      target: "ci",
      platform: LINUX_AMD64,
    })

    const lintedContainer = ciContainer.withExec(["npm", "run", "lint:ci"])
    await lintedContainer.sync()
    await lintedContainer.withExec(["npm", "run", "test:ci"]).sync()
  }

  private async publishImage(
    source: Directory,
    ociRegistry: string,
    registryUsername: string,
    registryPassword: Secret,
    dockerfilePath: string,
    imageRepository: string,
    imageTag: string,
  ): Promise<PublishedImage> {
    const publishedReference = await source
      .dockerBuild({
        dockerfile: dockerfilePath,
        target: "prod",
        platform: LINUX_AMD64,
      })
      .withRegistryAuth(ociRegistry, registryUsername, registryPassword)
      .publish(`${imageRepository}:${imageTag}`)

    return {
      reference: publishedReference,
      digest: this.digestFromPublishedReference(publishedReference),
    }
  }

  private async releaseTempChart(
    source: Directory,
    artifacts: TempArtifacts,
    ociRegistry: string,
    registryUsername: string,
    registryPassword: Secret,
    backendDigest: string,
    frontendDigest: string,
  ): Promise<string> {
    const chartArchivePath = `${CHART_TEMP_ROOT_PATH}/packages/pleey-${artifacts.chartVersion}.tgz`

    const toolingContainer = dag
      .container()
      .from("alpine/helm:3.19.0")
      .withExec(["apk", "add", "--no-cache", "bash", "ruby"])
      .withMountedDirectory(REPOSITORY_ROOT_PATH, source)
      .withWorkdir(REPOSITORY_ROOT_PATH)
      .withEnvVariable(
        "BACKEND_IMAGE_REPOSITORY",
        artifacts.backendImageRepository,
      )
      .withEnvVariable("BACKEND_IMAGE_TAG", artifacts.imageTag)
      .withEnvVariable("BACKEND_IMAGE_DIGEST", backendDigest)
      .withEnvVariable(
        "FRONTEND_IMAGE_REPOSITORY",
        artifacts.frontendImageRepository,
      )
      .withEnvVariable("FRONTEND_IMAGE_TAG", artifacts.imageTag)
      .withEnvVariable("FRONTEND_IMAGE_DIGEST", frontendDigest)
      .withEnvVariable("TEMP_CHART_VERSION", artifacts.chartVersion)
      .withEnvVariable("TEMP_APP_VERSION", artifacts.imageTag)
      .withEnvVariable("CHART_TEMP_ROOT", CHART_TEMP_ROOT_PATH)
      .withEnvVariable(
        "CHART_OUTPUT_DIR",
        `${CHART_TEMP_ROOT_PATH}/packages`,
      )
      .withExec(["bash", "scripts/package-temp-chart.sh"])

    await toolingContainer
      .withEnvVariable("OCI_REGISTRY", ociRegistry)
      .withEnvVariable("OCI_REGISTRY_USERNAME", registryUsername)
      .withEnvVariable("CHART_ARCHIVE", chartArchivePath)
      .withEnvVariable("CHART_REPOSITORY", artifacts.chartRepository)
      .withSecretVariable("OCI_REGISTRY_PASSWORD", registryPassword)
      .withExec([
        "sh",
        "-ec",
        'echo "$OCI_REGISTRY_PASSWORD" | helm registry login "$OCI_REGISTRY" -u "$OCI_REGISTRY_USERNAME" --password-stdin && helm push "$CHART_ARCHIVE" "$CHART_REPOSITORY"',
      ])
      .sync()

    return `${artifacts.chartRepository}/pleey:${artifacts.chartVersion}`
  }

  private newTempArtifacts(
    ociRegistry: string,
    repository: string,
    runNumber: string,
    runAttempt: string,
    gitSha: string,
  ): TempArtifacts {
    const repositorySlug = repository.toLowerCase()
    const imageTag = `demo-${runNumber}-${runAttempt}-${this.shortSha(gitSha)}`
    const chartVersion = `0.0.0-demo.${runNumber}.${runAttempt}`

    return {
      backendImageRepository: `${ociRegistry}/${repositorySlug}/tmp/backend`,
      frontendImageRepository: `${ociRegistry}/${repositorySlug}/tmp/frontend`,
      chartRepository: `oci://${ociRegistry}/${repositorySlug}/tmp/charts`,
      imageTag,
      chartVersion,
    }
  }

  private digestFromPublishedReference(publishedReference: string): string {
    const [_imageRef, digest] = publishedReference.split("@")

    if (!digest) {
      throw new Error(
        `published reference ${publishedReference} does not contain a digest`,
      )
    }

    return digest
  }

  private shortSha(gitSha: string): string {
    return gitSha.length <= 7 ? gitSha : gitSha.slice(0, 7)
  }
}
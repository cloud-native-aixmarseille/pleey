import { argument, dag, Directory, object, func, Secret } from "@dagger.io/dagger"

const REPOSITORY_ROOT_PATH = "/src"
const CHART_TEMP_ROOT_PATH = "/tmp/pleey-demo-chart"
const LINUX_AMD64 = "linux/amd64"

const BACKEND_SOURCE_IGNORE = [
  "*",
  "!application",
  "!application/backend",
  "!application/backend/**",
  "!scripts",
  "!scripts/**",
]

const FRONTEND_SOURCE_IGNORE = [
  "*",
  "!application",
  "!application/frontend",
  "!application/frontend/**",
  "!application/backend",
  "!application/backend/src",
  "!application/backend/src/schema.gql",
  "!scripts",
  "!scripts/**",
]

const CHART_SOURCE_IGNORE = [
  "*",
  "!charts",
  "!charts/application",
  "!charts/application/**",
  "!scripts",
  "!scripts/package-temp-chart.sh",
]

const DEMO_DISPATCH_SOURCE_IGNORE = [
  "*",
  "!application",
  "!application/backend",
  "!application/backend/**",
  "!application/frontend",
  "!application/frontend/**",
  "!charts",
  "!charts/application",
  "!charts/application/**",
  "!scripts",
  "!scripts/**",
]

@object()
export class TempArtifacts {
  @func()
  backendImageRepository: string

  @func()
  frontendImageRepository: string

  @func()
  chartRepository: string

  @func()
  imageTag: string

  @func()
  chartVersion: string

  constructor(
    backendImageRepository: string,
    frontendImageRepository: string,
    chartRepository: string,
    imageTag: string,
    chartVersion: string,
  ) {
    this.backendImageRepository = backendImageRepository
    this.frontendImageRepository = frontendImageRepository
    this.chartRepository = chartRepository
    this.imageTag = imageTag
    this.chartVersion = chartVersion
  }
}

@object()
export class PublishedImage {
  @func()
  reference: string

  @func()
  digest: string

  constructor(reference: string, digest: string) {
    this.reference = reference
    this.digest = digest
  }
}

@object()
export class PleeyDemoCi {
  @func()
  prepareTempArtifacts(
    ociRegistry: string,
    repository: string,
    runNumber: string,
    runAttempt: string,
    gitSha: string,
  ): string {
    const artifacts = this.newTempArtifacts(
      ociRegistry,
      repository,
      runNumber,
      runAttempt,
      gitSha,
    )

    return this.serializeTempArtifacts(ociRegistry, artifacts)
  }

  @func()
  async lintAndTestBackend(
    @argument({ ignore: BACKEND_SOURCE_IGNORE }) source: Directory,
  ): Promise<void> {
    await this.lintAndTestService(source, "backend")
  }

  @func()
  async lintAndTestFrontend(
    @argument({ ignore: FRONTEND_SOURCE_IGNORE }) source: Directory,
  ): Promise<void> {
    await this.lintAndTestService(source, "frontend")
  }

  @func()
  async publishBackendImage(
    @argument({ ignore: BACKEND_SOURCE_IGNORE }) source: Directory,
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

    const publishedImage = await this.publishImage(
      source,
      ociRegistry,
      registryUsername,
      registryPassword,
      "application/backend/Dockerfile",
      artifacts.backendImageRepository,
      artifacts.imageTag,
    )

    return this.serializePublishedImage(publishedImage)
  }

  @func()
  async publishFrontendImage(
    @argument({ ignore: FRONTEND_SOURCE_IGNORE }) source: Directory,
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

    const publishedImage = await this.publishImage(
      source,
      ociRegistry,
      registryUsername,
      registryPassword,
      "application/frontend/Dockerfile",
      artifacts.frontendImageRepository,
      artifacts.imageTag,
    )

    return this.serializePublishedImage(publishedImage)
  }

  @func()
  async releaseTempChart(
    @argument({ ignore: CHART_SOURCE_IGNORE }) source: Directory,
    ociRegistry: string,
    registryUsername: string,
    registryPassword: Secret,
    repository: string,
    runNumber: string,
    runAttempt: string,
    gitSha: string,
    backendDigest: string,
    frontendDigest: string,
  ): Promise<string> {
    const artifacts = this.newTempArtifacts(
      ociRegistry,
      repository,
      runNumber,
      runAttempt,
      gitSha,
    )

    return this.publishTempChart(
      source,
      artifacts,
      ociRegistry,
      registryUsername,
      registryPassword,
      backendDigest,
      frontendDigest,
    )
  }

  /**
   * Runs standalone CI with lint, tests, image publication, and chart publication.
   */
  @func()
  async demoDispatch(
    @argument({ ignore: DEMO_DISPATCH_SOURCE_IGNORE }) source: Directory,
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

    await this.lintAndTestBackend(source)
    await this.lintAndTestFrontend(source)

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

    const chartReference = await this.publishTempChart(
      source,
      artifacts,
      ociRegistry,
      registryUsername,
      registryPassword,
      backendImage.digest,
      frontendImage.digest,
    )

    return [
      "## Demo artifacts",
      "",
      `- Backend image tag: ${artifacts.imageTag}`,
      `- Frontend image tag: ${artifacts.imageTag}`,
      `- Helm chart version: ${artifacts.chartVersion}`,
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

  private async publishTempChart(
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

    return new TempArtifacts(
      `${ociRegistry}/${repositorySlug}/demo/backend`,
      `${ociRegistry}/${repositorySlug}/demo/frontend`,
      `oci://${ociRegistry}/${repositorySlug}/demo/charts`,
      imageTag,
      chartVersion,
    )
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

  private serializeTempArtifacts(
    ociRegistry: string,
    artifacts: TempArtifacts,
  ): string {
    return JSON.stringify({
      registry: ociRegistry,
      backendImageRepository: artifacts.backendImageRepository,
      frontendImageRepository: artifacts.frontendImageRepository,
      chartRepository: artifacts.chartRepository,
      imageTag: artifacts.imageTag,
      chartVersion: artifacts.chartVersion,
    })
  }

  private serializePublishedImage(publishedImage: PublishedImage): string {
    return JSON.stringify({
      reference: publishedImage.reference,
      digest: publishedImage.digest,
    })
  }
}
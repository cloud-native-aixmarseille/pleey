# frontend

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: main](https://img.shields.io/badge/AppVersion-main-informational?style=flat-square)

Pleey frontend service subchart.

**Homepage:** <https://github.com/cloud-native-aixmarseille/pleey>

## Maintainers

| Name              | Email | URL                                                  |
| ----------------- | ----- | ---------------------------------------------------- |
| Pleey Maintainers |       | <https://github.com/cloud-native-aixmarseille/pleey> |

## Source Code

- <https://github.com/cloud-native-aixmarseille/pleey>

## Values

| Key                                        | Type   | Default                                                                     | Description |
| ------------------------------------------ | ------ | --------------------------------------------------------------------------- | ----------- |
| affinity                                   | object | `{}`                                                                        |             |
| autoscaling.enabled                        | bool   | `false`                                                                     |             |
| autoscaling.maxReplicas                    | int    | `5`                                                                         |             |
| autoscaling.minReplicas                    | int    | `2`                                                                         |             |
| autoscaling.targetCPUUtilizationPercentage | int    | `80`                                                                        |             |
| config.apiUrl                              | string | `""`                                                                        |             |
| extraEnv                                   | list   | `[]`                                                                        |             |
| extraEnvFrom                               | list   | `[]`                                                                        |             |
| extraVolumeMounts                          | list   | `[]`                                                                        |             |
| extraVolumes                               | list   | `[]`                                                                        |             |
| global.applicationName                     | string | `"pleey-app"`                                                               |             |
| global.fullnameOverride                    | string | `""`                                                                        |             |
| global.imagePullPolicy                     | string | `"Always"`                                                                  |             |
| global.imagePullSecrets                    | list   | `[]`                                                                        |             |
| global.imageRegistry                       | string | `""`                                                                        |             |
| image.digest                               | string | `"sha256:81361f6d6b745b6aafd6955197894af773c0ea328f95145a4bd1029f6da12849"` |             |
| image.pullPolicy                           | string | `""`                                                                        |             |
| image.registry                             | string | `""`                                                                        |             |
| image.repository                           | string | `"ghcr.io/cloud-native-aixmarseille/pleey/frontend"`                        |             |
| image.tag                                  | string | `"latest"`                                                                  |             |
| imagePullSecrets                           | list   | `[]`                                                                        |             |
| livenessProbe.enabled                      | bool   | `true`                                                                      |             |
| livenessProbe.httpGet.path                 | string | `"/"`                                                                       |             |
| livenessProbe.httpGet.port                 | string | `"http"`                                                                    |             |
| livenessProbe.initialDelaySeconds          | int    | `10`                                                                        |             |
| livenessProbe.periodSeconds                | int    | `30`                                                                        |             |
| livenessProbe.timeoutSeconds               | int    | `5`                                                                         |             |
| nodeSelector                               | object | `{}`                                                                        |             |
| podAnnotations                             | object | `{}`                                                                        |             |
| podLabels                                  | object | `{}`                                                                        |             |
| podSecurityContext.fsGroup                 | int    | `10001`                                                                     |             |
| podSecurityContext.runAsGroup              | int    | `10001`                                                                     |             |
| podSecurityContext.runAsNonRoot            | bool   | `true`                                                                      |             |
| podSecurityContext.runAsUser               | int    | `10001`                                                                     |             |
| podSecurityContext.seccompProfile.type     | string | `"RuntimeDefault"`                                                          |             |
| priorityClassName                          | string | `""`                                                                        |             |
| readinessProbe.enabled                     | bool   | `true`                                                                      |             |
| readinessProbe.httpGet.path                | string | `"/"`                                                                       |             |
| readinessProbe.httpGet.port                | string | `"http"`                                                                    |             |
| readinessProbe.initialDelaySeconds         | int    | `5`                                                                         |             |
| readinessProbe.periodSeconds               | int    | `10`                                                                        |             |
| readinessProbe.timeoutSeconds              | int    | `5`                                                                         |             |
| replicaCount                               | int    | `1`                                                                         |             |
| resources.limits.cpu                       | string | `"200m"`                                                                    |             |
| resources.limits.memory                    | string | `"256Mi"`                                                                   |             |
| resources.requests.cpu                     | string | `"50m"`                                                                     |             |
| resources.requests.memory                  | string | `"128Mi"`                                                                   |             |
| securityContext.allowPrivilegeEscalation   | bool   | `false`                                                                     |             |
| securityContext.capabilities.drop[0]       | string | `"ALL"`                                                                     |             |
| securityContext.readOnlyRootFilesystem     | bool   | `true`                                                                      |             |
| service.annotations                        | object | `{}`                                                                        |             |
| service.port                               | int    | `80`                                                                        |             |
| service.targetPort                         | int    | `8080`                                                                      |             |
| service.type                               | string | `"ClusterIP"`                                                               |             |
| startupProbe.enabled                       | bool   | `true`                                                                      |             |
| startupProbe.failureThreshold              | int    | `12`                                                                        |             |
| startupProbe.httpGet.path                  | string | `"/"`                                                                       |             |
| startupProbe.httpGet.port                  | string | `"http"`                                                                    |             |
| startupProbe.periodSeconds                 | int    | `5`                                                                         |             |
| terminationGracePeriodSeconds              | int    | `30`                                                                        |             |
| tolerations                                | list   | `[]`                                                                        |             |
| topologySpreadConstraints                  | list   | `[]`                                                                        |             |

---

Autogenerated from chart metadata using [helm-docs v1.14.2](https://github.com/norwoodj/helm-docs/releases/v1.14.2)

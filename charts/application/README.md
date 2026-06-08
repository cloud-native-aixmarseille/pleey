# pleey

![Version: 0.3.0](https://img.shields.io/badge/Version-0.3.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.3.0](https://img.shields.io/badge/AppVersion-0.3.0-informational?style=flat-square)

Production-ready umbrella chart for the Pleey frontend, backend, PostgreSQL, and Valkey runtime.

**Homepage:** <https://github.com/cloud-native-aixmarseille/pleey>

## Maintainers

| Name              | Email | URL                                                  |
| ----------------- | ----- | ---------------------------------------------------- |
| Pleey Maintainers |       | <https://github.com/cloud-native-aixmarseille/pleey> |

## Source Code

- <https://github.com/cloud-native-aixmarseille/pleey>

## Requirements

| Repository             | Name     | Version |
| ---------------------- | -------- | ------- |
| file://charts/backend  | backend  | 0.3.0   |
| file://charts/frontend | frontend | 0.3.0   |

## Values

| Key                                            | Type   | Default                                                                     | Description |
| ---------------------------------------------- | ------ | --------------------------------------------------------------------------- | ----------- |
| backend.enabled                                | bool   | `true`                                                                      |             |
| frontend.enabled                               | bool   | `true`                                                                      |             |
| gateway.ingress.annotations                    | object | `{}`                                                                        |             |
| gateway.ingress.apiPath                        | string | `"/api"`                                                                    |             |
| gateway.ingress.className                      | string | `""`                                                                        |             |
| gateway.ingress.frontendPath                   | string | `"/"`                                                                       |             |
| gateway.ingress.graphqlPath                    | string | `"/graphql"`                                                                |             |
| gateway.ingress.host                           | string | `"pleey.localhost"`                                                         |             |
| gateway.ingress.pathType                       | string | `"Prefix"`                                                                  |             |
| gateway.ingress.socketPath                     | string | `"/socket.io"`                                                              |             |
| gateway.ingress.tls                            | list   | `[]`                                                                        |             |
| gateway.provider                               | string | `"ingress"`                                                                 |             |
| global.applicationName                         | string | `"pleey-app"`                                                               |             |
| global.fullnameOverride                        | string | `""`                                                                        |             |
| global.imagePullPolicy                         | string | `"Always"`                                                                  |             |
| global.imagePullSecrets                        | list   | `[]`                                                                        |             |
| global.imageRegistry                           | string | `""`                                                                        |             |
| global.storageClass                            | string | `""`                                                                        |             |
| networkPolicy.egress                           | list   | `[]`                                                                        |             |
| networkPolicy.enabled                          | bool   | `true`                                                                      |             |
| networkPolicy.ingress                          | list   | `[]`                                                                        |             |
| podDisruptionBudget.enabled                    | bool   | `false`                                                                     |             |
| podDisruptionBudget.minAvailable               | int    | `1`                                                                         |             |
| tests.enabled                                  | bool   | `true`                                                                      |             |
| tests.image.digest                             | string | `"sha256:b8d1827e38a1d49cd17217efd7b07d689e4ea1744e39c7dcbb95533d175bea65"` |             |
| tests.image.pullPolicy                         | string | `""`                                                                        |             |
| tests.image.registry                           | string | `"docker.io"`                                                               |             |
| tests.image.repository                         | string | `"busybox"`                                                                 |             |
| tests.image.tag                                | string | `"1.37.0"`                                                                  |             |
| tests.livenessProbe.exec.command[0]            | string | `"sh"`                                                                      |             |
| tests.livenessProbe.exec.command[1]            | string | `"-ec"`                                                                     |             |
| tests.livenessProbe.exec.command[2]            | string | `"ps -o pid= 1 >/dev/null"`                                                 |             |
| tests.livenessProbe.failureThreshold           | int    | `3`                                                                         |             |
| tests.livenessProbe.initialDelaySeconds        | int    | `1`                                                                         |             |
| tests.livenessProbe.periodSeconds              | int    | `10`                                                                        |             |
| tests.livenessProbe.timeoutSeconds             | int    | `5`                                                                         |             |
| tests.podSecurityContext.fsGroup               | int    | `10001`                                                                     |             |
| tests.podSecurityContext.runAsGroup            | int    | `10001`                                                                     |             |
| tests.podSecurityContext.runAsNonRoot          | bool   | `true`                                                                      |             |
| tests.podSecurityContext.runAsUser             | int    | `10001`                                                                     |             |
| tests.podSecurityContext.seccompProfile.type   | string | `"RuntimeDefault"`                                                          |             |
| tests.readinessProbe.exec.command[0]           | string | `"sh"`                                                                      |             |
| tests.readinessProbe.exec.command[1]           | string | `"-ec"`                                                                     |             |
| tests.readinessProbe.exec.command[2]           | string | `"ps -o pid= 1 >/dev/null"`                                                 |             |
| tests.readinessProbe.failureThreshold          | int    | `3`                                                                         |             |
| tests.readinessProbe.initialDelaySeconds       | int    | `1`                                                                         |             |
| tests.readinessProbe.periodSeconds             | int    | `10`                                                                        |             |
| tests.readinessProbe.timeoutSeconds            | int    | `5`                                                                         |             |
| tests.resources.limits.cpu                     | string | `"50m"`                                                                     |             |
| tests.resources.limits.memory                  | string | `"32Mi"`                                                                    |             |
| tests.resources.requests.cpu                   | string | `"10m"`                                                                     |             |
| tests.resources.requests.memory                | string | `"16Mi"`                                                                    |             |
| tests.securityContext.allowPrivilegeEscalation | bool   | `false`                                                                     |             |
| tests.securityContext.capabilities.drop[0]     | string | `"ALL"`                                                                     |             |
| tests.securityContext.readOnlyRootFilesystem   | bool   | `true`                                                                      |             |
| tests.securityContext.runAsGroup               | int    | `10001`                                                                     |             |
| tests.securityContext.runAsNonRoot             | bool   | `true`                                                                      |             |
| tests.securityContext.runAsUser                | int    | `10001`                                                                     |             |

---

Autogenerated from chart metadata using [helm-docs v1.14.2](https://github.com/norwoodj/helm-docs/releases/v1.14.2)

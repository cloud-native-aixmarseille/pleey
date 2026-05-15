# front

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.1.0](https://img.shields.io/badge/AppVersion-0.1.0-informational?style=flat-square)

A Helm chart for the frontend component of pleey-app

## Requirements

| Repository                               | Name   | Version |
| ---------------------------------------- | ------ | ------- |
| oci://registry-1.docker.io/bitnamicharts | common | 2.31.3  |

## Values

| Key                                                                              | Type   | Default                                                                     | Description |
| -------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------- | ----------- |
| affinity                                                                         | object | `{}`                                                                        |             |
| autoscaling.enabled                                                              | bool   | `false`                                                                     |             |
| autoscaling.maxReplicas                                                          | int    | `100`                                                                       |             |
| autoscaling.minReplicas                                                          | int    | `1`                                                                         |             |
| autoscaling.targetCPUUtilizationPercentage                                       | int    | `80`                                                                        |             |
| config.apiUrl                                                                    | string | `"http://back.local"`                                                       |             |
| fullnameOverride                                                                 | string | `""`                                                                        |             |
| image.digest                                                                     | string | `""`                                                                        |             |
| image.pullPolicy                                                                 | string | `"Always"`                                                                  |             |
| image.repository                                                                 | string | `"ghcr.io/cloud-native-aixmarseille/pleey/frontend"`                        |             |
| image.tag                                                                        | string | `""`                                                                        |             |
| imagePullSecrets                                                                 | list   | `[]`                                                                        |             |
| ingress.annotations."cert-manager.io/cluster-issuer"                             | string | `"letsencrypt"`                                                             |             |
| ingress.className                                                                | string | `"nginx"`                                                                   |             |
| ingress.enabled                                                                  | bool   | `false`                                                                     |             |
| ingress.hosts[0].host                                                            | string | `"chart-example.local"`                                                     |             |
| ingress.hosts[0].paths[0].path                                                   | string | `"/"`                                                                       |             |
| ingress.hosts[0].paths[0].pathType                                               | string | `"ImplementationSpecific"`                                                  |             |
| ingress.tls[0].hosts[0]                                                          | string | `"chart-example.local"`                                                     |             |
| ingress.tls[0].secretName                                                        | string | `"chart-example-tls"`                                                       |             |
| livenessProbe.enabled                                                            | bool   | `true`                                                                      |             |
| livenessProbe.failureThreshold                                                   | int    | `3`                                                                         |             |
| livenessProbe.httpGet.path                                                       | string | `"/"`                                                                       |             |
| livenessProbe.httpGet.port                                                       | string | `"http"`                                                                    |             |
| livenessProbe.initialDelaySeconds                                                | int    | `10`                                                                        |             |
| livenessProbe.periodSeconds                                                      | int    | `30`                                                                        |             |
| livenessProbe.timeoutSeconds                                                     | int    | `5`                                                                         |             |
| nameOverride                                                                     | string | `""`                                                                        |             |
| networkPolicy.allowDnsEgress                                                     | bool   | `true`                                                                      |             |
| networkPolicy.allowSameNamespace                                                 | bool   | `true`                                                                      |             |
| networkPolicy.enabled                                                            | bool   | `true`                                                                      |             |
| networkPolicy.ingressNamespaceSelector.matchLabels."kubernetes.io/metadata.name" | string | `"ingress-nginx"`                                                           |             |
| nodeSelector                                                                     | object | `{}`                                                                        |             |
| podAnnotations                                                                   | object | `{}`                                                                        |             |
| podLabels                                                                        | object | `{}`                                                                        |             |
| podSecurityContext.fsGroup                                                       | int    | `10001`                                                                     |             |
| podSecurityContext.runAsGroup                                                    | int    | `10001`                                                                     |             |
| podSecurityContext.runAsNonRoot                                                  | bool   | `true`                                                                      |             |
| podSecurityContext.runAsUser                                                     | int    | `10001`                                                                     |             |
| podSecurityContext.seccompProfile.type                                           | string | `"RuntimeDefault"`                                                          |             |
| readinessProbe.enabled                                                           | bool   | `true`                                                                      |             |
| readinessProbe.failureThreshold                                                  | int    | `3`                                                                         |             |
| readinessProbe.httpGet.path                                                      | string | `"/"`                                                                       |             |
| readinessProbe.httpGet.port                                                      | string | `"http"`                                                                    |             |
| readinessProbe.initialDelaySeconds                                               | int    | `5`                                                                         |             |
| readinessProbe.periodSeconds                                                     | int    | `10`                                                                        |             |
| readinessProbe.timeoutSeconds                                                    | int    | `5`                                                                         |             |
| replicaCount                                                                     | int    | `1`                                                                         |             |
| resources                                                                        | object | `{}`                                                                        |             |
| resourcesPreset                                                                  | string | `"micro"`                                                                   |             |
| securityContext.allowPrivilegeEscalation                                         | bool   | `false`                                                                     |             |
| securityContext.capabilities.drop[0]                                             | string | `"ALL"`                                                                     |             |
| securityContext.readOnlyRootFilesystem                                           | bool   | `true`                                                                      |             |
| securityContext.runAsGroup                                                       | int    | `10001`                                                                     |             |
| securityContext.runAsNonRoot                                                     | bool   | `true`                                                                      |             |
| securityContext.runAsUser                                                        | int    | `10001`                                                                     |             |
| service.port                                                                     | int    | `8080`                                                                      |             |
| service.type                                                                     | string | `"ClusterIP"`                                                               |             |
| serviceAccount.annotations                                                       | object | `{}`                                                                        |             |
| serviceAccount.automount                                                         | bool   | `false`                                                                     |             |
| serviceAccount.create                                                            | bool   | `true`                                                                      |             |
| serviceAccount.name                                                              | string | `""`                                                                        |             |
| startupProbe.enabled                                                             | bool   | `false`                                                                     |             |
| startupProbe.httpGet.path                                                        | string | `"/"`                                                                       |             |
| startupProbe.httpGet.port                                                        | string | `"http"`                                                                    |             |
| tolerations                                                                      | list   | `[]`                                                                        |             |
| volumeMounts                                                                     | list   | `[]`                                                                        |             |
| volumes                                                                          | list   | `[]`                                                                        |             |

---

Autogenerated from chart metadata using [helm-docs v1.14.2](https://github.com/norwoodj/helm-docs/releases/v1.14.2)

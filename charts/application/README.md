# quiz-app

![Version: 0.0.0](https://img.shields.io/badge/Version-0.0.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.0.0](https://img.shields.io/badge/AppVersion-0.0.0-informational?style=flat-square)

QuizMaster - Interactive Quiz Application with real-time gameplay

**Homepage:** <https://github.com/cloud-native-aixmarseille/quiz-app>

## Maintainers

| Name            | Email                 | URL |
| --------------- | --------------------- | --- |
| QuizMaster Team | <support@example.com> |     |

## Source Code

- <https://github.com/cloud-native-aixmarseille/quiz-app>

## Requirements

| Repository                           | Name       | Version |
| ------------------------------------ | ---------- | ------- |
| <https://charts.bitnami.com/bitnami> | PostgreSQL | 15.x.x  |

## Values

| Key                                                                  | Type   | Default                                              | Description |
| -------------------------------------------------------------------- | ------ | ---------------------------------------------------- | ----------- |
| backend.affinity                                                     | object | `{}`                                                 |             |
| backend.autoscaling.enabled                                          | bool   | `false`                                              |             |
| backend.autoscaling.maxReplicas                                      | int    | `10`                                                 |             |
| backend.autoscaling.minReplicas                                      | int    | `2`                                                  |             |
| backend.autoscaling.targetCPUUtilizationPercentage                   | int    | `80`                                                 |             |
| backend.autoscaling.targetMemoryUtilizationPercentage                | int    | `80`                                                 |             |
| backend.enabled                                                      | bool   | `true`                                               |             |
| backend.env.corsOrigin                                               | string | `"*"`                                                |             |
| backend.env.nodeEnv                                                  | string | `"production"`                                       |             |
| backend.env.otelExporterOtlpEndpoint                                 | string | `"http://otel-collector:4318"`                       |             |
| backend.env.port                                                     | int    | `3001`                                               |             |
| backend.image.pullPolicy                                             | string | `"IfNotPresent"`                                     |             |
| backend.image.registry                                               | string | `"ghcr.io"`                                          |             |
| backend.image.repository                                             | string | `"cloud-native-aixmarseille/quiz-app/backend"`       |             |
| backend.image.tag                                                    | string | `"latest"`                                           |             |
| backend.livenessProbe.failureThreshold                               | int    | `3`                                                  |             |
| backend.livenessProbe.httpGet.path                                   | string | `"/api/health/live"`                                 |             |
| backend.livenessProbe.httpGet.port                                   | int    | `3001`                                               |             |
| backend.livenessProbe.initialDelaySeconds                            | int    | `40`                                                 |             |
| backend.livenessProbe.periodSeconds                                  | int    | `30`                                                 |             |
| backend.livenessProbe.timeoutSeconds                                 | int    | `10`                                                 |             |
| backend.nodeSelector                                                 | object | `{}`                                                 |             |
| backend.podAnnotations                                               | object | `{}`                                                 |             |
| backend.podSecurityContext.fsGroup                                   | int    | `1000`                                               |             |
| backend.podSecurityContext.runAsNonRoot                              | bool   | `true`                                               |             |
| backend.podSecurityContext.runAsUser                                 | int    | `1000`                                               |             |
| backend.readinessProbe.failureThreshold                              | int    | `3`                                                  |             |
| backend.readinessProbe.httpGet.path                                  | string | `"/api/health/ready"`                                |             |
| backend.readinessProbe.httpGet.port                                  | int    | `3001`                                               |             |
| backend.readinessProbe.initialDelaySeconds                           | int    | `30`                                                 |             |
| backend.readinessProbe.periodSeconds                                 | int    | `10`                                                 |             |
| backend.readinessProbe.timeoutSeconds                                | int    | `5`                                                  |             |
| backend.replicaCount                                                 | int    | `2`                                                  |             |
| backend.resources.limits.cpu                                         | string | `"1000m"`                                            |             |
| backend.resources.limits.memory                                      | string | `"512Mi"`                                            |             |
| backend.resources.requests.cpu                                       | string | `"500m"`                                             |             |
| backend.resources.requests.memory                                    | string | `"256Mi"`                                            |             |
| backend.secrets.databaseUrl                                          | string | `""`                                                 |             |
| backend.secrets.jwtSecret                                            | string | `"change-me-in-production-use-strong-random-secret"` |             |
| backend.securityContext.allowPrivilegeEscalation                     | bool   | `false`                                              |             |
| backend.securityContext.capabilities.drop[0]                         | string | `"ALL"`                                              |             |
| backend.securityContext.readOnlyRootFilesystem                       | bool   | `false`                                              |             |
| backend.service.annotations                                          | object | `{}`                                                 |             |
| backend.service.port                                                 | int    | `3001`                                               |             |
| backend.service.targetPort                                           | int    | `3001`                                               |             |
| backend.service.type                                                 | string | `"ClusterIP"`                                        |             |
| backend.tolerations                                                  | list   | `[]`                                                 |             |
| frontend.affinity                                                    | object | `{}`                                                 |             |
| frontend.autoscaling.enabled                                         | bool   | `false`                                              |             |
| frontend.autoscaling.maxReplicas                                     | int    | `10`                                                 |             |
| frontend.autoscaling.minReplicas                                     | int    | `2`                                                  |             |
| frontend.autoscaling.targetCPUUtilizationPercentage                  | int    | `80`                                                 |             |
| frontend.enabled                                                     | bool   | `true`                                               |             |
| frontend.env.apiUrl                                                  | string | `"http://backend:3001"`                              |             |
| frontend.image.pullPolicy                                            | string | `"IfNotPresent"`                                     |             |
| frontend.image.registry                                              | string | `"ghcr.io"`                                          |             |
| frontend.image.repository                                            | string | `"cloud-native-aixmarseille/quiz-app/frontend"`      |             |
| frontend.image.tag                                                   | string | `"latest"`                                           |             |
| frontend.livenessProbe.httpGet.path                                  | string | `"/"`                                                |             |
| frontend.livenessProbe.httpGet.port                                  | int    | `80`                                                 |             |
| frontend.livenessProbe.initialDelaySeconds                           | int    | `10`                                                 |             |
| frontend.livenessProbe.periodSeconds                                 | int    | `30`                                                 |             |
| frontend.livenessProbe.timeoutSeconds                                | int    | `10`                                                 |             |
| frontend.nodeSelector                                                | object | `{}`                                                 |             |
| frontend.podAnnotations                                              | object | `{}`                                                 |             |
| frontend.podSecurityContext.fsGroup                                  | int    | `101`                                                |             |
| frontend.podSecurityContext.runAsNonRoot                             | bool   | `true`                                               |             |
| frontend.podSecurityContext.runAsUser                                | int    | `101`                                                |             |
| frontend.readinessProbe.httpGet.path                                 | string | `"/"`                                                |             |
| frontend.readinessProbe.httpGet.port                                 | int    | `80`                                                 |             |
| frontend.readinessProbe.initialDelaySeconds                          | int    | `5`                                                  |             |
| frontend.readinessProbe.periodSeconds                                | int    | `10`                                                 |             |
| frontend.readinessProbe.timeoutSeconds                               | int    | `5`                                                  |             |
| frontend.replicaCount                                                | int    | `2`                                                  |             |
| frontend.resources.limits.cpu                                        | string | `"500m"`                                             |             |
| frontend.resources.limits.memory                                     | string | `"256Mi"`                                            |             |
| frontend.resources.requests.cpu                                      | string | `"250m"`                                             |             |
| frontend.resources.requests.memory                                   | string | `"128Mi"`                                            |             |
| frontend.securityContext.allowPrivilegeEscalation                    | bool   | `false`                                              |             |
| frontend.securityContext.capabilities.drop[0]                        | string | `"ALL"`                                              |             |
| frontend.securityContext.readOnlyRootFilesystem                      | bool   | `true`                                               |             |
| frontend.service.annotations                                         | object | `{}`                                                 |             |
| frontend.service.port                                                | int    | `80`                                                 |             |
| frontend.service.targetPort                                          | int    | `80`                                                 |             |
| frontend.service.type                                                | string | `"ClusterIP"`                                        |             |
| frontend.tolerations                                                 | list   | `[]`                                                 |             |
| global.imagePullPolicy                                               | string | `"IfNotPresent"`                                     |             |
| global.imagePullSecrets                                              | list   | `[]`                                                 |             |
| global.imageRegistry                                                 | string | `""`                                                 |             |
| global.storageClass                                                  | string | `""`                                                 |             |
| grafana.dashboards                                                   | object | `{}`                                                 |             |
| grafana.enabled                                                      | bool   | `false`                                              |             |
| ingress.annotations."cert-manager.io/cluster-issuer"                 | string | `"letsencrypt-prod"`                                 |             |
| ingress.annotations."nginx.ingress.kubernetes.io/force-ssl-redirect" | string | `"true"`                                             |             |
| ingress.annotations."nginx.ingress.kubernetes.io/proxy-read-timeout" | string | `"3600"`                                             |             |
| ingress.annotations."nginx.ingress.kubernetes.io/proxy-send-timeout" | string | `"3600"`                                             |             |
| ingress.annotations."nginx.ingress.kubernetes.io/ssl-redirect"       | string | `"true"`                                             |             |
| ingress.className                                                    | string | `"nginx"`                                            |             |
| ingress.enabled                                                      | bool   | `true`                                               |             |
| ingress.hosts[0].host                                                | string | `"quiz.example.com"`                                 |             |
| ingress.hosts[0].paths[0].path                                       | string | `"/api"`                                             |             |
| ingress.hosts[0].paths[0].pathType                                   | string | `"Prefix"`                                           |             |
| ingress.hosts[0].paths[0].service.name                               | string | `"backend"`                                          |             |
| ingress.hosts[0].paths[0].service.port                               | int    | `3001`                                               |             |
| ingress.hosts[0].paths[1].path                                       | string | `"/socket.io"`                                       |             |
| ingress.hosts[0].paths[1].pathType                                   | string | `"Prefix"`                                           |             |
| ingress.hosts[0].paths[1].service.name                               | string | `"backend"`                                          |             |
| ingress.hosts[0].paths[1].service.port                               | int    | `3001`                                               |             |
| ingress.hosts[0].paths[2].path                                       | string | `"/"`                                                |             |
| ingress.hosts[0].paths[2].pathType                                   | string | `"Prefix"`                                           |             |
| ingress.hosts[0].paths[2].service.name                               | string | `"frontend"`                                         |             |
| ingress.hosts[0].paths[2].service.port                               | int    | `80`                                                 |             |
| ingress.tls[0].hosts[0]                                              | string | `"quiz.example.com"`                                 |             |
| ingress.tls[0].secretName                                            | string | `"quiz-app-tls"`                                     |             |
| monitoring.enabled                                                   | bool   | `false`                                              |             |
| monitoring.prometheusRule.enabled                                    | bool   | `false`                                              |             |
| monitoring.prometheusRule.labels                                     | object | `{}`                                                 |             |
| monitoring.prometheusRule.rules                                      | list   | `[]`                                                 |             |
| monitoring.serviceMonitor.enabled                                    | bool   | `false`                                              |             |
| monitoring.serviceMonitor.interval                                   | string | `"30s"`                                              |             |
| monitoring.serviceMonitor.labels                                     | object | `{}`                                                 |             |
| monitoring.serviceMonitor.scrapeTimeout                              | string | `"10s"`                                              |             |
| networkPolicy.egress[0].to[0].namespaceSelector                      | object | `{}`                                                 |             |
| networkPolicy.enabled                                                | bool   | `false`                                              |             |
| networkPolicy.ingress[0].from[0].namespaceSelector.matchLabels.name  | string | `"ingress-nginx"`                                    |             |
| otelCollector.enabled                                                | bool   | `false`                                              |             |
| otelCollector.image.pullPolicy                                       | string | `"IfNotPresent"`                                     |             |
| otelCollector.image.registry                                         | string | `"docker.io"`                                        |             |
| otelCollector.image.repository                                       | string | `"otel/opentelemetry-collector"`                     |             |
| otelCollector.image.tag                                              | string | `"0.105.0"`                                          |             |
| otelCollector.resources.limits.cpu                                   | string | `"500m"`                                             |             |
| otelCollector.resources.limits.memory                                | string | `"256Mi"`                                            |             |
| otelCollector.resources.requests.cpu                                 | string | `"100m"`                                             |             |
| otelCollector.resources.requests.memory                              | string | `"128Mi"`                                            |             |
| otelCollector.service.port                                           | int    | `4318`                                               |             |
| otelCollector.service.type                                           | string | `"ClusterIP"`                                        |             |
| podDisruptionBudget.enabled                                          | bool   | `false`                                              |             |
| podDisruptionBudget.minAvailable                                     | int    | `1`                                                  |             |
| postgresql.auth.database                                             | string | `"quizdb"`                                           |             |
| postgresql.auth.existingSecret                                       | string | `""`                                                 |             |
| postgresql.auth.password                                             | string | `"quizapp_password"`                                 |             |
| postgresql.auth.secretKeys.adminPasswordKey                          | string | `"postgres-password"`                                |             |
| postgresql.auth.secretKeys.userPasswordKey                           | string | `"password"`                                         |             |
| postgresql.auth.username                                             | string | `"quizapp"`                                          |             |
| postgresql.enabled                                                   | bool   | `true`                                               |             |
| postgresql.enabled                                                   | bool   | `true`                                               |             |
| postgresql.image.repository                                          | string | `"bitnamilegacy/postgresql"`                         |             |
| postgresql.metrics.enabled                                           | bool   | `false`                                              |             |
| postgresql.metrics.image.repository                                  | string | `"bitnamilegacy/postgres-exporter"`                  |             |
| postgresql.metrics.serviceMonitor.enabled                            | bool   | `false`                                              |             |
| postgresql.primary.extendedConfiguration                             | string | `"max_connections = 100\nshared_buffers = 128MB\n"`  |             |
| postgresql.primary.persistence.enabled                               | bool   | `true`                                               |             |
| postgresql.primary.persistence.size                                  | string | `"8Gi"`                                              |             |
| postgresql.primary.resources.limits.cpu                              | string | `"1000m"`                                            |             |
| postgresql.primary.resources.limits.memory                           | string | `"512Mi"`                                            |             |
| postgresql.primary.resources.requests.cpu                            | string | `"500m"`                                             |             |
| postgresql.primary.resources.requests.memory                         | string | `"256Mi"`                                            |             |
| postgresql.readReplicas.replicaCount                                 | int    | `0`                                                  |             |
| postgresql.volumePermissions.image.repository                        | string | `"bitnamilegacy/os-shell"`                           |             |
| serviceAccount.annotations                                           | object | `{}`                                                 |             |
| serviceAccount.create                                                | bool   | `true`                                               |             |
| serviceAccount.name                                                  | string | `""`                                                 |             |

---

Autogenerated from chart metadata using [helm-docs v1.14.2](https://github.com/norwoodj/helm-docs/releases/v1.14.2)

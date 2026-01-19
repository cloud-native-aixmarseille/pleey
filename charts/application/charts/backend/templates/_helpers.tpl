{{- define "pleey.backend.applicationName" -}}
{{- default "pleey-app" .Values.global.applicationName | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "pleey.backend.applicationFullname" -}}
{{- if .Values.global.fullnameOverride }}
{{- .Values.global.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := include "pleey.backend.applicationName" . }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{- define "pleey.backend.fullname" -}}
{{- printf "%s-backend" (include "pleey.backend.applicationFullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "pleey.backend.databaseFullname" -}}
{{- default (printf "%s-postgres" (include "pleey.backend.applicationFullname" .)) .Values.database.cloudnativepg.clusterName | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "pleey.backend.appSecretName" -}}
{{- printf "%s-app" (include "pleey.backend.applicationFullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "pleey.backend.databaseApplicationSecretName" -}}
{{- printf "%s-app" (include "pleey.backend.databaseFullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "pleey.backend.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "pleey.backend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "pleey.backend.applicationName" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: backend
{{- end }}

{{- define "pleey.backend.labels" -}}
helm.sh/chart: {{ include "pleey.backend.chart" . }}
app.kubernetes.io/name: {{ include "pleey.backend.applicationName" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: {{ include "pleey.backend.applicationName" . }}
app.kubernetes.io/component: backend
{{- end }}

{{- define "pleey.backend.namespace" -}}
{{- .Release.Namespace -}}
{{- end }}

{{- define "pleey.backend.serviceAccountName" -}}
{{- default (include "pleey.backend.applicationFullname" .) .Values.serviceAccount.name -}}
{{- end }}

{{- define "pleey.backend.image" -}}
{{- $registry := default .Values.global.imageRegistry .Values.image.registry -}}
{{- $repository := required "backend.image.repository is required" .Values.image.repository -}}
{{- $tag := default .Chart.AppVersion .Values.image.tag -}}
{{- $digest := default "" .Values.image.digest -}}
{{- if $registry -}}
{{- if $digest -}}{{- printf "%s/%s@%s" $registry $repository $digest -}}{{- else -}}{{- printf "%s/%s:%s" $registry $repository $tag -}}{{- end -}}
{{- else -}}
{{- if $digest -}}{{- printf "%s@%s" $repository $digest -}}{{- else -}}{{- printf "%s:%s" $repository $tag -}}{{- end -}}
{{- end -}}
{{- end }}

{{- define "pleey.backend.waitForDatabaseImage" -}}
{{- $image := .Values.waitForDatabase.image -}}
{{- $registry := default .Values.global.imageRegistry $image.registry -}}
{{- $repository := required "backend.waitForDatabase.image.repository is required" $image.repository -}}
{{- $tag := default .Chart.AppVersion $image.tag -}}
{{- $digest := default "" $image.digest -}}
{{- if $registry -}}
{{- if $digest -}}{{- printf "%s/%s@%s" $registry $repository $digest -}}{{- else -}}{{- printf "%s/%s:%s" $registry $repository $tag -}}{{- end -}}
{{- else -}}
{{- if $digest -}}{{- printf "%s@%s" $repository $digest -}}{{- else -}}{{- printf "%s:%s" $repository $tag -}}{{- end -}}
{{- end -}}
{{- end }}

{{- define "pleey.backend.imagePullPolicy" -}}
{{- default (default "IfNotPresent" .Values.global.imagePullPolicy) .Values.image.pullPolicy }}
{{- end }}

{{- define "pleey.backend.waitForDatabaseImagePullPolicy" -}}
{{- default (default "IfNotPresent" .Values.global.imagePullPolicy) .Values.waitForDatabase.image.pullPolicy }}
{{- end }}

{{- define "pleey.backend.imagePullSecrets" -}}
{{- $secrets := concat (default list .Values.global.imagePullSecrets) (default list .Values.imagePullSecrets) -}}
{{- if $secrets }}
imagePullSecrets:
{{- toYaml $secrets | nindent 2 }}
{{- end }}
{{- end }}

{{- define "pleey.backend.jwtSecretName" -}}
{{- default (include "pleey.backend.appSecretName" .) .Values.auth.existingSecret.name }}
{{- end }}

{{- define "pleey.backend.jwtSecretKey" -}}
{{- default "JWT_SECRET" .Values.auth.existingSecret.jwtSecretKey }}
{{- end }}

{{- define "pleey.backend.jwtSecret" -}}
{{- $secretName := include "pleey.backend.appSecretName" . -}}
{{- $secret := lookup "v1" "Secret" (include "pleey.backend.namespace" .) $secretName -}}
{{- if and $secret (hasKey $secret.data "JWT_SECRET") -}}
{{- index $secret.data "JWT_SECRET" | b64dec -}}
{{- else if .Values.auth.jwtSecret -}}
{{- .Values.auth.jwtSecret -}}
{{- else -}}
{{- randAlphaNum 48 -}}
{{- end -}}
{{- end }}

{{- define "pleey.backend.databaseSecretName" -}}
{{- if eq .Values.database.provider "cloudnativepg" -}}
{{- include "pleey.backend.databaseApplicationSecretName" . -}}
{{- else if .Values.database.external.existingSecret.name -}}
{{- .Values.database.external.existingSecret.name -}}
{{- else -}}
{{- include "pleey.backend.appSecretName" . -}}
{{- end -}}
{{- end }}

{{- define "pleey.backend.databaseSecretKey" -}}
{{- if eq .Values.database.provider "cloudnativepg" -}}
uri
{{- else if .Values.database.external.existingSecret.name -}}
{{- .Values.database.external.existingSecret.key -}}
{{- else -}}
DATABASE_URL
{{- end -}}
{{- end }}

{{- define "pleey.backend.databaseUrl" -}}
{{- if eq .Values.database.provider "external" -}}
{{- required "database.external.url is required when database.provider=external and no existing secret is provided" .Values.database.external.url -}}
{{- else -}}
{{- "" -}}
{{- end -}}
{{- end }}

{{- define "pleey.backend.databaseWaitHost" -}}
{{- if eq .Values.database.provider "cloudnativepg" -}}
{{- printf "%s-rw" (include "pleey.backend.databaseFullname" .) -}}
{{- else -}}
{{- .Values.database.external.host -}}
{{- end -}}
{{- end }}

{{- define "pleey.backend.databaseWaitPort" -}}
{{- default 5432 .Values.database.external.port -}}
{{- end }}

{{- define "pleey.backend.valkeySecretName" -}}
{{- if and (eq .Values.valkey.provider "external") .Values.valkey.external.existingSecret.name -}}
{{- .Values.valkey.external.existingSecret.name -}}
{{- else -}}
{{- include "pleey.backend.appSecretName" . -}}
{{- end -}}
{{- end }}

{{- define "pleey.backend.valkeySecretKey" -}}
{{- if and (eq .Values.valkey.provider "external") .Values.valkey.external.existingSecret.name -}}
{{- .Values.valkey.external.existingSecret.key -}}
{{- else -}}
VALKEY_URL
{{- end -}}
{{- end }}

{{- define "pleey.backend.valkeyFullname" -}}
{{- if .Values.valkey.fullnameOverride -}}
{{- .Values.valkey.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default "valkey" .Values.valkey.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end }}

{{- define "pleey.backend.valkeyUrl" -}}
{{- if eq .Values.valkey.provider "builtin" -}}
{{- printf "redis://%s:%d" (include "pleey.backend.valkeyFullname" .) (int .Values.valkey.service.port) -}}
{{- else -}}
{{- required "valkey.external.url is required when valkey.provider=external and no existing secret is provided" .Values.valkey.external.url -}}
{{- end -}}
{{- end }}

{{- define "pleey.backend.jwtSecretMountPath" -}}
/var/run/pleey-secrets/jwt
{{- end }}

{{- define "pleey.backend.jwtSecretFile" -}}
{{- printf "%s/%s" (include "pleey.backend.jwtSecretMountPath" .) (include "pleey.backend.jwtSecretKey" .) -}}
{{- end }}

{{- define "pleey.backend.databaseSecretMountPath" -}}
/var/run/pleey-secrets/database
{{- end }}

{{- define "pleey.backend.databaseSecretFile" -}}
{{- printf "%s/%s" (include "pleey.backend.databaseSecretMountPath" .) (include "pleey.backend.databaseSecretKey" .) -}}
{{- end }}

{{- define "pleey.backend.valkeySecretMountPath" -}}
/var/run/pleey-secrets/valkey
{{- end }}

{{- define "pleey.backend.valkeySecretFile" -}}
{{- printf "%s/%s" (include "pleey.backend.valkeySecretMountPath" .) (include "pleey.backend.valkeySecretKey" .) -}}
{{- end }}

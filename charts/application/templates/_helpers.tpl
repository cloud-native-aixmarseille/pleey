{{- define "pleey.name" -}}
{{- default .Chart.Name .Values.global.applicationName | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "pleey.fullname" -}}
{{- if .Values.global.fullnameOverride }}
{{- .Values.global.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := include "pleey.name" . }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{- define "pleey.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "pleey.selectorLabels" -}}
app.kubernetes.io/name: {{ include "pleey.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{- define "pleey.labels" -}}
helm.sh/chart: {{ include "pleey.chart" . }}
{{ include "pleey.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "pleey.component.labels" -}}
{{ include "pleey.labels" . }}
app.kubernetes.io/part-of: {{ include "pleey.name" . }}
{{- end }}

{{- define "pleey.backend.fullname" -}}
{{- printf "%s-backend" (include "pleey.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "pleey.frontend.fullname" -}}
{{- printf "%s-frontend" (include "pleey.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "pleey.valkey.fullname" -}}
{{- $backend := default (dict) .Values._backend -}}
{{- $fullnameOverride := dig "valkey" "fullnameOverride" "" $backend -}}
{{- if $fullnameOverride }}
{{- $fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := dig "valkey" "nameOverride" "valkey" $backend -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end }}

{{- define "pleey.database.fullname" -}}
{{- default (printf "%s-postgres" (include "pleey.fullname" .)) (dig "database" "cloudnativepg" "clusterName" "" (default (dict) .Values._backend)) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "pleey.appSecretName" -}}
{{- printf "%s-app" (include "pleey.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "pleey.databaseApplicationSecretName" -}}
{{- printf "%s-app" (include "pleey.database.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "pleey.backend.selectorLabels" -}}
{{ include "pleey.selectorLabels" . }}
app.kubernetes.io/component: backend
{{- end }}

{{- define "pleey.frontend.selectorLabels" -}}
{{ include "pleey.selectorLabels" . }}
app.kubernetes.io/component: frontend
{{- end }}

{{- define "pleey.backend.labels" -}}
{{ include "pleey.component.labels" . }}
app.kubernetes.io/component: backend
{{- end }}

{{- define "pleey.frontend.labels" -}}
{{ include "pleey.component.labels" . }}
app.kubernetes.io/component: frontend
{{- end }}

{{- define "pleey.namespace" -}}
{{- .Release.Namespace -}}
{{- end }}

{{- define "pleey.test.image" -}}
{{- $registry := default .Values.global.imageRegistry .Values.tests.image.registry -}}
{{- $repository := required "tests.image.repository is required" .Values.tests.image.repository -}}
{{- $tag := default .Chart.AppVersion .Values.tests.image.tag -}}
{{- $digest := default "" .Values.tests.image.digest -}}
{{- if $registry -}}
{{- if $digest -}}{{- printf "%s/%s@%s" $registry $repository $digest -}}{{- else -}}{{- printf "%s/%s:%s" $registry $repository $tag -}}{{- end -}}
{{- else -}}
{{- if $digest -}}{{- printf "%s@%s" $repository $digest -}}{{- else -}}{{- printf "%s:%s" $repository $tag -}}{{- end -}}
{{- end -}}
{{- end }}

{{- define "pleey.test.imagePullPolicy" -}}
{{- default (default "IfNotPresent" .Values.global.imagePullPolicy) .Values.tests.image.pullPolicy -}}
{{- end }}

{{- define "pleey.backend.servicePort" -}}
{{- dig "service" "port" 3001 (default (dict) .Values._backend) -}}
{{- end }}

{{- define "pleey.backend.targetPort" -}}
{{- dig "service" "targetPort" 3001 (default (dict) .Values._backend) -}}
{{- end }}

{{- define "pleey.frontend.servicePort" -}}
{{- dig "service" "port" 80 (default (dict) .Values._frontend) -}}
{{- end }}

{{- define "pleey.frontend.targetPort" -}}
{{- dig "service" "targetPort" 8080 (default (dict) .Values._frontend) -}}
{{- end }}

{{- define "pleey.root.backendDatabaseProvider" -}}
{{- $backend := default (dict) .Values._backend -}}
{{- if dig "database" "external" "url" "" $backend -}}external{{- else -}}{{- dig "database" "provider" "cloudnativepg" $backend -}}{{- end -}}
{{- end -}}

{{- define "pleey.backend.valkeyProvider" -}}
{{- dig "valkey" "provider" "builtin" (default (dict) .Values._backend) -}}
{{- end }}

{{- define "pleey.backend.valkeyEnabled" -}}
{{- dig "valkey" "enabled" true (default (dict) .Values._backend) -}}
{{- end }}

{{- define "pleey.root.backendCloudnativepgOperatorEnabled" -}}
{{- if eq (include "pleey.root.backendDatabaseProvider" .) "external" -}}false{{- else -}}{{- dig "cloudnativepgOperator" "enabled" false (default (dict) .Values._backend) -}}{{- end -}}
{{- end -}}

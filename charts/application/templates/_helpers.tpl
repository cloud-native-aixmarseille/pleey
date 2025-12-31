{{/*
Expand the name of the chart.
*/}}
{{- define "quiz-app.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "quiz-app.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "quiz-app.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "quiz-app.labels" -}}
helm.sh/chart: {{ include "quiz-app.chart" . }}
{{ include "quiz-app.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "quiz-app.selectorLabels" -}}
app.kubernetes.io/name: {{ include "quiz-app.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Backend labels
*/}}
{{- define "quiz-app.backend.labels" -}}
{{ include "quiz-app.labels" . }}
app.kubernetes.io/component: backend
{{- end }}

{{/*
Backend selector labels
*/}}
{{- define "quiz-app.backend.selectorLabels" -}}
{{ include "quiz-app.selectorLabels" . }}
app.kubernetes.io/component: backend
{{- end }}

{{/*
Frontend labels
*/}}
{{- define "quiz-app.frontend.labels" -}}
{{ include "quiz-app.labels" . }}
app.kubernetes.io/component: frontend
{{- end }}

{{/*
Frontend selector labels
*/}}
{{- define "quiz-app.frontend.selectorLabels" -}}
{{ include "quiz-app.selectorLabels" . }}
app.kubernetes.io/component: frontend
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "quiz-app.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "quiz-app.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Backend image
*/}}
{{- define "quiz-app.backend.image" -}}
{{- $registry := .Values.backend.image.registry | default .Values.global.imageRegistry -}}
{{- $repository := .Values.backend.image.repository -}}
{{- $tag := .Values.backend.image.tag | default .Chart.AppVersion -}}
{{- $digest := .Values.backend.image.digest -}}
{{- if $registry }}
{{- if $digest }}
{{- printf "%s/%s@%s" $registry $repository $digest }}
{{- else }}
{{- printf "%s/%s:%s" $registry $repository $tag }}
{{- end }}
{{- else }}
{{- if $digest }}
{{- printf "%s@%s" $repository $digest }}
{{- else }}
{{- printf "%s:%s" $repository $tag }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Frontend image
*/}}
{{- define "quiz-app.frontend.image" -}}
{{- $registry := .Values.frontend.image.registry | default .Values.global.imageRegistry -}}
{{- $repository := .Values.frontend.image.repository -}}
{{- $tag := .Values.frontend.image.tag | default .Chart.AppVersion -}}
{{- $digest := .Values.frontend.image.digest -}}
{{- if $registry }}
{{- if $digest }}
{{- printf "%s/%s@%s" $registry $repository $digest }}
{{- else }}
{{- printf "%s/%s:%s" $registry $repository $tag }}
{{- end }}
{{- else }}
{{- if $digest }}
{{- printf "%s@%s" $repository $digest }}
{{- else }}
{{- printf "%s:%s" $repository $tag }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Wait-for-db init container image
*/}}
{{- define "quiz-app.waitForDb.image" -}}
{{- $registry := .Values.global.initContainers.waitForDb.image.registry | default .Values.global.imageRegistry -}}
{{- $repository := .Values.global.initContainers.waitForDb.image.repository | default "busybox" -}}
{{- $tag := .Values.global.initContainers.waitForDb.image.tag | default "1.36" -}}
{{- $digest := .Values.global.initContainers.waitForDb.image.digest -}}
{{- if $registry }}
{{- if $digest }}
{{- printf "%s/%s@%s" $registry $repository $digest }}
{{- else }}
{{- printf "%s/%s:%s" $registry $repository $tag }}
{{- end }}
{{- else }}
{{- if $digest }}
{{- printf "%s@%s" $repository $digest }}
{{- else }}
{{- printf "%s:%s" $repository $tag }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Database URL for backend
*/}}
{{- define "quiz-app.databaseUrl" -}}
{{- if .Values.backend.secrets.databaseUrl }}
{{- .Values.backend.secrets.databaseUrl }}
{{- else if .Values.postgresql.enabled }}
{{- $username := .Values.postgresql.auth.username -}}
{{- $password := .Values.postgresql.auth.password -}}
{{- $database := .Values.postgresql.auth.database -}}
{{- $host := printf "%s-postgresql" (include "quiz-app.fullname" .) -}}
{{- printf "postgresql://%s:%s@%s:5432/%s?schema=public" $username $password $host $database }}
{{- else }}
{{- required "Either postgresql.enabled must be true or backend.secrets.databaseUrl must be provided" .Values.backend.secrets.databaseUrl }}
{{- end }}
{{- end }}

{{/*
Image pull policy
*/}}
{{- define "quiz-app.imagePullPolicy" -}}
{{- .Values.global.imagePullPolicy | default "IfNotPresent" }}
{{- end }}

{{/*
Namespace to deploy resources into

Checkov’s Helm scan renders with namespace=default; by defaulting the
namespace override to a non-default value in values.yaml, we avoid
CKV_K8S_21 failures while still allowing overrides per environment.
*/}}
{{- define "quiz-app.namespace" -}}
{{- .Values.global.namespaceOverride | default .Values.namespaceOverride | default .Release.Namespace -}}
{{- end }}

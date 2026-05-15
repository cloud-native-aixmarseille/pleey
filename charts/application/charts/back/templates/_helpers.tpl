{{/* Expand the name of the chart. */}}
{{- define "default.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/* ----------------------------------------------------------------
      Create a default fully qualified app name.
      We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
      If release name contains chart name it will be used as a full name.
    ------------------------------------------------------------------ */}}
{{- define "default.fullname" -}}
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

{{/* Create chart name and version as used by the chart label. */}}
{{- define "default.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/* Common labels */}}
{{- define "default.labels" -}}
helm.sh/chart: {{ include "default.chart" . }}
{{ include "default.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/* Selector labels */}}
{{- define "default.selectorLabels" -}}
app.kubernetes.io/name: {{ include "default.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/* Create the name of the service account to use */}}
{{- define "default.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "default.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/* Resolve the namespace for namespaced resources. */}}
{{- define "default.namespace" -}}
{{- .Release.Namespace -}}
{{- end }}

{{/* Build the immutable application image reference when a digest is provided. */}}
{{- define "default.image" -}}
{{- $repository := .Values.image.repository -}}
{{- $registry := "" -}}
{{- $tag := .Values.image.tag | default .Chart.AppVersion -}}
{{- $digest := .Values.image.digest -}}
{{- with .Values.backend }}
{{- with .image }}
{{- $registry = .registry | default $registry -}}
{{- $repository = .repository | default $repository -}}
{{- $tag = .tag | default $tag -}}
{{- $digest = .digest | default $digest -}}
{{- end }}
{{- end }}
{{- with .Values.back }}
{{- with .image }}
{{- $registry = .registry | default $registry -}}
{{- $repository = .repository | default $repository -}}
{{- $tag = .tag | default $tag -}}
{{- $digest = .digest | default $digest -}}
{{- end }}
{{- end }}
{{- if $registry -}}
{{- if $digest -}}
{{- printf "%s/%s@%s" $registry $repository $digest -}}
{{- else -}}
{{- printf "%s/%s:%s" $registry $repository $tag -}}
{{- end -}}
{{- else -}}
{{- if $digest -}}
{{- printf "%s@%s" $repository $digest -}}
{{- else -}}
{{- printf "%s:%s" $repository $tag -}}
{{- end -}}
{{- end -}}
{{- end }}

{{/* Resolve application image pull policy, allowing backend/back image overrides. */}}
{{- define "default.imagePullPolicy" -}}
{{- $pullPolicy := .Values.image.pullPolicy -}}
{{- with .Values.backend }}
{{- with .image }}
{{- $pullPolicy = .pullPolicy | default $pullPolicy -}}
{{- end }}
{{- end }}
{{- with .Values.back }}
{{- with .image }}
{{- $pullPolicy = .pullPolicy | default $pullPolicy -}}
{{- end }}
{{- end }}
{{- $pullPolicy -}}
{{- end }}

{{/* Build the immutable wait-for-db init container image reference when a digest is provided. */}}
{{- define "default.waitForDbImage" -}}
{{- if .Values.waitForDb.image.digest -}}
{{- printf "%s@%s" .Values.waitForDb.image.repository .Values.waitForDb.image.digest -}}
{{- else -}}
{{- printf "%s:%s" .Values.waitForDb.image.repository .Values.waitForDb.image.tag -}}
{{- end -}}
{{- end }}


{{/* Compute default annotations to be used */}}
{{- define "default.annotations" -}}
{{- if .Values.commonAnnotations }}
{{ toYaml .Values.commonAnnotations }}
{{- end }}
{{- end }}

{{/* Compute the database hostname */}}
{{/* TODO: remove this dev only value */}}
{{- define "default.databaseHost" -}}
{{.Release.Name }}-postgresql
{{- end }}

{{/* Compute the database url string */}}
{{/* TODO: remove this dev only value */}}
{{- define "default.databaseUrl" -}}
{{- $root := . -}}
{{- if .Values.config.secrets.databaseUrl -}}
{{- .Values.config.secrets.databaseUrl -}}
{{- else if .Values.postgresql.enabled -}}
{{- printf "postgresql://%s:%s@%s:5432/%s?schema=public" .Values.postgresql.auth.username .Values.postgresql.auth.password (include "default.databaseHost" .) .Values.postgresql.auth.database -}}
{{- else -}}
{{- with .Values.global -}}
{{- with .postgresql -}}
{{- if .enabled -}}
{{- printf "postgresql://%s:%s@%s:5432/%s?schema=public" .auth.username .auth.password (include "default.databaseHost" $root) .auth.database -}}
{{- else -}}
{{- required "Either postgresql.enabled must be true or config.secrets.databaseUrl must be provided" $root.Values.config.secrets.databaseUrl -}}
{{- end -}}
{{- else -}}
{{- required "Either postgresql.enabled must be true or config.secrets.databaseUrl must be provided" $root.Values.config.secrets.databaseUrl -}}
{{- end -}}
{{- else -}}
{{- required "Either postgresql.enabled must be true or config.secrets.databaseUrl must be provided" $root.Values.config.secrets.databaseUrl -}}
{{- end -}}
{{- end -}}
{{- end }}

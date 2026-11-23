{{- define "pleey.frontend.applicationName" -}}
{{- default "pleey-app" .Values.global.applicationName | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "pleey.frontend.applicationFullname" -}}
{{- if .Values.global.fullnameOverride }}
{{- .Values.global.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := include "pleey.frontend.applicationName" . }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{- define "pleey.frontend.fullname" -}}
{{- printf "%s-frontend" (include "pleey.frontend.applicationFullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "pleey.frontend.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "pleey.frontend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "pleey.frontend.applicationName" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: frontend
{{- end }}

{{- define "pleey.frontend.labels" -}}
helm.sh/chart: {{ include "pleey.frontend.chart" . }}
app.kubernetes.io/name: {{ include "pleey.frontend.applicationName" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: {{ include "pleey.frontend.applicationName" . }}
app.kubernetes.io/component: frontend
{{- end }}

{{- define "pleey.frontend.namespace" -}}
{{- .Release.Namespace -}}
{{- end }}

{{- define "pleey.frontend.image" -}}
{{- $registry := default .Values.global.imageRegistry .Values.image.registry -}}
{{- $repository := required "frontend.image.repository is required" .Values.image.repository -}}
{{- $tag := default .Chart.AppVersion .Values.image.tag -}}
{{- $digest := default "" .Values.image.digest -}}
{{- if $registry -}}
{{- if $digest -}}{{- printf "%s/%s@%s" $registry $repository $digest -}}{{- else -}}{{- printf "%s/%s:%s" $registry $repository $tag -}}{{- end -}}
{{- else -}}
{{- if $digest -}}{{- printf "%s@%s" $repository $digest -}}{{- else -}}{{- printf "%s:%s" $repository $tag -}}{{- end -}}
{{- end -}}
{{- end }}

{{- define "pleey.frontend.imagePullPolicy" -}}
{{- default (default "IfNotPresent" .Values.global.imagePullPolicy) .Values.image.pullPolicy }}
{{- end }}

{{- define "pleey.frontend.imagePullSecrets" -}}
{{- $secrets := concat (default list .Values.global.imagePullSecrets) (default list .Values.imagePullSecrets) -}}
{{- if $secrets }}
imagePullSecrets:
{{- toYaml $secrets | nindent 2 }}
{{- end }}
{{- end }}

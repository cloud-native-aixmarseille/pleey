# ADR 0012: Support media on quiz questions

- Status: Proposed
- Proposed date: 2026-09-28
- Accepted date: N/A

## Context

Pleey quiz questions previously carried only text, answers, timing, and scoring metadata. Issue `#90` adds image, audio, and video prompts for quiz rounds in both the management editor and live play.

The repository already has:

- a reusable `Media` persistence model used for avatars
- GraphQL upload support in management flows
- live host and player surfaces that must render question prompts through normal browser media elements

The first implementation on this branch reuses the existing media model and serves quiz question binaries directly from the application. The ADR still needs to clarify whether that should remain the long-term direction or only the initial scoped step for quiz questions.

The decision needs to define:

- where quiz question media is stored
- what management and runtime payloads expose
- how guest participants and authenticated hosts/players fetch the binary media
- how media replacement invalidates caches
- how future media optimization and delivery requirements fit into this first step

## Decision Drivers

- reuse the existing media persistence pattern instead of introducing a second asset model
- keep GraphQL and realtime payloads small by avoiding embedded binary blobs
- let guest participants load question media directly in browser media elements during live play
- keep cache invalidation simple when question media is replaced
- keep the change scoped to quiz questions without changing prediction prompt behavior
- leave room for a future shared media platform with object storage, CDN delivery, and asset optimization
- avoid blocking the current quiz feature on a broader media-transformation pipeline that does not yet exist in the repository

## Considered Options

### Option 1: Reuse `Media` with an optional `Question` relation and serve versioned URLs

Store quiz question binaries in the existing `Media` model, relate them optionally from `Question`, expose only `mimeType` and a versioned URI in management/runtime payloads, and serve the binary content from `/api/quiz-questions/:questionId/media`.

### Option 2: Embed binary question media in GraphQL and realtime payloads

Encode question media directly in mutations, queries, or live runtime snapshots, for example as base64 strings or raw buffers.

### Option 3: Introduce a dedicated media pipeline with object storage, CDN delivery, and optimized variants

Store question media outside the current application database, normalize uploads to product display requirements, generate optimized derivatives, and serve them through object storage plus a CDN or similar edge-cached delivery service.

## Decision

Adopt option 1 for the initial quiz question feature.

This ADR records the current implementation choice for issue `#90`. It does not declare application-served database media to be the final repository-wide media architecture.

Quiz question media will follow these rules:

- `Question` owns an optional relation to `Media`
- the initial upload flow stores the uploaded binary in the existing `Media` model without derivative generation
- quiz management mutations accept media upload on create/update and an explicit clear instruction on update
- management and runtime payloads expose question media as `{ mimeType, uri }`
- binary media is fetched from a versioned HTTP route at `/api/quiz-questions/:questionId/media?v=<updatedAt>`
- the question media route remains public because guest/player live surfaces must load it without back-office JWTs
- prediction prompts do not adopt question media in this change
- expanding question media into a broader reusable media platform requires a superseding ADR

## Consequences

### Positive

- reuses the existing database-backed media model instead of adding another asset abstraction
- keeps GraphQL and realtime payloads transport-light by sending metadata plus a URI only
- lets browser-native image, audio, and video elements render question media directly on host and player surfaces
- versioned URLs provide straightforward cache busting when question media is replaced

### Negative

- question media becomes a public asset by identifier, so confidentiality relies on unguessable IDs rather than authenticated download
- storing larger media binaries in the application database can increase storage and backup costs compared with dedicated object storage
- the application currently stores and serves the uploaded original rather than display-fit or bandwidth-optimized derivatives
- captions, transcripts, or richer accessibility metadata are not modeled as first-class quiz question assets in this decision

### Follow-Up

- keep question media validation limited to image, audio, and video uploads unless a superseding ADR expands supported asset types
- define display constraints, upload budgets, and optimization targets per supported media type and surface
- add upload normalization and optimized serving requirements for image dimensions, weight, formats, and future audio/video derivative needs once those product constraints are agreed
- if asset volume, privacy, moderation, or performance needs grow, propose a superseding ADR for object storage, CDN delivery, signed URLs, and derivative generation
- implementation work: issue `#90` and the quiz question media feature changes on this branch

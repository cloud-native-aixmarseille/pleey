# ADR 0012: Support media on quiz questions

- Status: Proposed
- Proposed date: 2026-09-28
- Accepted date: N/A

## Context

Quiz questions need optional image, audio, and video prompts in the management editor and live host/player views (issue [#90](https://github.com/cloud-native-aixmarseille/pleey/issues/90)).

The first implementation in [PR #497](https://github.com/cloud-native-aixmarseille/pleey/pull/497) stores uploaded originals in the existing database-backed `Media` model and serves them through `/api/quiz-questions/:questionId/media`. Review requests dedicated media storage and CDN delivery, plus uploads that fit the display and are optimized before storage and serving. Merely listing those requirements as future work does not address that feedback.

The existing avatar implementation also uses `Media`. Quiz media must introduce reusable media capabilities without coupling domain/application code to a storage vendor or requiring an unrelated avatar migration. Prediction prompts remain outside this feature.

## Decision Drivers

- Keep media binaries out of PostgreSQL, GraphQL responses, and realtime snapshots.
- Deliver playable assets directly through a CDN, including to guest participants.
- Bound upload, decoding, transformation, storage, and download costs.
- Preserve question content when fitting media to mobile, editor, and host displays.
- Publish only validated, optimized assets; preserve existing media if replacement fails.
- Keep provider details behind ports and configuration, following [the architecture reference](../index.md).

## Considered Options

### Option 1: Database-backed originals served by the application

Reuse the avatar persistence and serve original files through the backend. This is the implementation currently on the branch, but it adds binary traffic and storage load to the application and does not satisfy the optimization requirements. Rejected as the target for this feature.

### Option 2: S3-compatible object storage, application-owned processing, and CDN delivery

Store originals privately while processing, publish optimized derivatives through a configured CDN origin, and retain asset metadata and object keys in PostgreSQL. This allows independent storage and delivery providers, but Pleey must operate transformation workers, cleanup, and media tooling.

### Option 3: Managed media service with storage, transformations, and CDN delivery

Use a media service to validate/process uploads, store assets, and deliver optimized derivatives. This reduces processing infrastructure owned by Pleey, but introduces provider-specific APIs, transformation pricing, and migration costs. The adapter must verify the same output constraints as an application-owned pipeline.

## Decision

Implement option 2: S3-compatible object storage with a configured CDN public base URL, Sharp for image normalization, and FFmpeg/FFprobe for audio/video validation and transcoding. The implementation direction was authorized on 2026-09-28; this ADR remains `Proposed` pending repository review. Local development uses SeaweedFS with a separate read-only delivery proxy; production supplies an existing bucket and CDN. Database-backed, application-served originals are not an interim implementation to merge under this ADR.

Processing is synchronous and bounded: only the completed optimized asset can be attached to a question. Originals exist only in bounded process memory/private temporary files and are removed after processing. Images start at WebP quality 80, with a quality floor of 65. Audio uses 128 kbit/s MP3; video uses H.264 CRF 23 and AAC. Assets have immutable UUID keys, short-lived signed read grants, and a 24-hour retirement grace period. Unattached pending uploads expire after one hour; a durable database asset ledger enables cleanup and retry across process restarts. Processing deadlines must be shorter than that pending lease. Cascade/soft deletion is reconciled by the cleanup worker.

### Storage and delivery

- Introduce reusable media storage and processing ports with infrastructure adapters. Quiz use-cases authorize the operation before processing or storing uploads; the composition root wires provider configuration.
- Persist asset identity, immutable object/provider key, verified output MIME type, byte size, image/video dimensions, and audio/video duration. Persist references from questions; do not persist quiz binary content in PostgreSQL.
- Keep originals private during processing and delete them after successful derivative publication unless a separate retention requirement is agreed. Failed processing must not expose an original as a fallback.
- Expose only ready assets through management/runtime media metadata containing asset identity, MIME type, a signed delivery URI, and expiry. Generate access grants after audience authorization; never persist signed URLs in database assets or shared party runtime state. Backend endpoints authorize grants; media bytes continue to flow directly through the delivery service.
- Each replacement receives a new immutable asset key. Publish the new asset before atomically switching the question reference. Keep the prior reference intact on upload, transformation, storage, or database failure.
- Compensate for a failed database write by deleting the new unreferenced asset. Retry failed cleanup durably and reconcile abandoned uploads. Remove old assets after replacement, removal, or question/game deletion after the agreed retirement grace period; cover cascading deletion too.
- All quiz objects are private, including media used by public parties. Access is decided per requesting context because one quiz can be reused by public and password-protected parties. Editors require current project permission; hosts require actual party ownership; players and guests require a successful join, a valid same-party socket session, and current membership. Password checks remain at join. Unjoined and cross-party observers receive no question/result context or media grants.
- Use S3 Signature V4 presigned GET URLs with configurable bounded lifetime (default deployment value: five minutes). The delivery proxy forwards the signed host, path, and query without rewriting them; the private origin validates every request, including ranges. Signed delivery uses `private, no-store` and disables intermediary response caching so an expired or unsigned request cannot hit a public cache. A future CDN-native signer may cache bytes only if the edge verifies viewer authorization before every cache hit.
- Refresh grants through authorized editor queries or party socket requests while the displayed asset remains accessible; preserve playback position on URL renewal. Kicking or leaving a party, ending player participation, or losing permissions prevents new grants; the owning host can still preview the current result after the party ends. Already issued bearer URLs remain usable until expiry, and downloaded bytes cannot be recalled. Immediate revocation would require per-request session validation and is outside this bounded-grant decision.

### Display and optimization requirements

The following are the initial acceptance limits. They apply server-side; client-side checks only improve feedback. MiB and KiB denote binary byte units.

| Media | Accepted uploads | Published representation and budget |
| --- | --- | --- |
| Image | JPEG, PNG, or WebP; at most 5 MiB and 25 megapixels; one static frame | WebP; fit inside 1600 × 900 pixels without cropping or upscaling; at most 512 KiB |
| Audio | MP3, WAV, or Ogg; at most 5 MiB and 120 seconds | MP3; at most 128 kbit/s and 2 MiB; preserve the full clip |
| Video | MP4 or WebM; at most 5 MiB and 60 seconds | MP4 with H.264 video and AAC audio when present; fit inside 1280 × 720 pixels without cropping or upscaling, at most 30 fps and 5 MiB; support progressive playback |

- Verify decoded content, container/codec, dimensions, frame count, and duration rather than trusting the filename or declared MIME prefix. Reject unsupported, corrupt, oversized, animated-image, or over-duration input with translated domain errors.
- Enforce the byte limit while reading the upload. Limit decoder pixels, processing time, memory, and concurrency; clean up temporary content on failure. A compressed upload limit alone does not bound decoding cost.
- Apply image orientation before resizing, strip nonessential metadata, preserve transparency, and encode the output before checking its byte budget. Reject a result that cannot meet the budget without violating the agreed quality floor; do not silently publish the original.
- Optimize audio/video before publishing. Keep their full duration; do not silently truncate a question prompt to satisfy a budget. Validate the final representation, including actual MIME type and size.
- Keep aspect ratio and show the entire image/video with `object-fit: contain`. The shared renderer currently uses full container width with a `20rem` maximum height; verify editor, host, and narrow player layouts so media does not obscure answers or cause horizontal scrolling. Serve the same optimized asset for persisted editor previews and live playback.
- Use native playback controls and metadata-only audio/video preloading. Set rendering MIME metadata from the published representation. Captions/transcripts remain an explicit accessibility requirement; an empty text track does not provide captions.

### Implementation acceptance

Both review requirements must be implemented and verified before this ADR can describe a completed feature:

1. Implement the S3, Sharp, and FFmpeg adapters with the budgets and quality settings above.
2. Provide explicit development and production configuration for storage, processing, CDN URLs, and credentials; keep secrets in the established config/secret mechanisms. Document deployment and failure recovery.
3. Replace quiz database binaries and the application download path with asset references and direct CDN URLs in both management and runtime mappings. Define a migration if branch-era quiz media has been deployed; preserve avatars.
4. Test valid media transformations, content spoofing, corrupt files, byte/pixel/duration limits, output budgets, and transparent/portrait/landscape images.
5. Test authorization before external side effects, failed replacements, database-write compensation, cleanup retries, concurrent replacements, removal, and cascading deletion.
6. Verify guest playback, seeking, URL renewal, replacement, and display fit on editor, host, and mobile player surfaces. Verify unauthenticated origin reads, expired/tampered grants, unjoined/cross-party observation, invalid sessions, kicks, and editor permission failures are denied. Confirm the final MIME metadata matches downloaded bytes.

## Consequences

### Positive

- Database backups and application replicas no longer carry quiz media binaries or playback traffic.
- Display-fit optimized assets give bounded storage and transfer costs.
- Immutable object keys avoid stale replacements; short-lived authorized URLs prevent permanent public access.
- Reusable ports support future media consumers without exposing vendor APIs to core layers.

### Negative

- This feature now requires a storage/CDN service and processing integration, configuration, and operational ownership.
- Processing adds save latency or requires an explicit asynchronous readiness flow; pending assets cannot enter live payloads.
- Object storage and database updates are not atomic, requiring compensation and durable cleanup.
- Issued bearer grants cannot be individually revoked before expiry; signed reads bypass shared caching in the provider-neutral S3 adapter.
- Media limits narrow the formats and durations accepted by the original MIME-prefix implementation.

### Follow-Up

- Complete the implementation acceptance items within issue [#90](https://github.com/cloud-native-aixmarseille/pleey/issues/90) and [PR #497](https://github.com/cloud-native-aixmarseille/pleey/pull/497); storage and optimization are not deferred enhancements.
- Keep status `Proposed` until repository review accepts this decision; the implementation uses the provider interfaces, quality settings, synchronous readiness, and retention windows specified above.
- Update [backend development](../../development/backend/index.md) and [frontend development](../../development/frontend/index.md) alongside the approved implementation.
- Convert any branch-era quiz binaries using the [conversion runbook](../../runbooks/quiz-media-conversion.md); the additive schema preserves originals until publication succeeds.
- Consider migrating avatars separately once the reusable media pipeline is established.

## Review References

- [Dedicated storage and CDN delivery](https://github.com/cloud-native-aixmarseille/pleey/pull/497#discussion_r4125924167).
- [Display fit and optimized storage/serving](https://github.com/cloud-native-aixmarseille/pleey/pull/497#discussion_r4125946253).

## Adapter References

- [Sharp resize options](https://sharp.pixelplumbing.com/api-resize/).
- [FFmpeg processing options](https://ffmpeg.org/ffmpeg.html).
- [AWS SDK S3 client](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/).

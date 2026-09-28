# ADR 0013: Share GraphQL upload stream reading

- Status: Proposed
- Proposed date: 2026-10-12
- Accepted date: N/A

## Context

Theme images and playable-content imports duplicate GraphQL upload resolution, stream reading, byte limits, and cleanup. Quiz and prediction imports already share their text reader. Other image surfaces currently generate assets rather than accepting uploaded files.

The requested extraction must retain authorization before reading theme bytes, configurable import limits, streaming CSV/text parsing, and feature-owned image validation and storage.

## Decision Drivers

- Reuse transport mechanics across existing and future upload consumers.
- Enforce byte limits while reading and close failed or abandoned streams.
- Preserve feature error codes and application ports.
- Avoid buffering text imports merely to share code with image uploads.

## Considered Options

### Option 1: Reuse the theme reader for every upload

This couples imports to image-specific errors and buffering, and mixes transport concerns with asset policy.

### Option 2: Extract a shared GraphQL reader with feature adapters

A domain-neutral presentation helper resolves upload metadata and exposes a lazy, single-use, bounded byte stream. Feature adapters supply their size limit and domain-error factory, then buffer image bytes or decode text incrementally.

## Decision

Use option 2, implementing the user's requested shared upload handling. Register `GraphqlUploadReader` in `SharedServicesModule` under the ownership rule in [ADR 0002](./0002-use-clean-architecture-with-strict-boundaries.md). Share the GraphQL file contract across theme, quiz, and prediction entry points.

Keep `ThemeAssetUploadReader` as the adapter to its application source, including deferred reading until authorization. Keep text decoding, line splitting, and cached full-text reads in `PlayableContentUploadReader`. Image format checks, decoding, re-encoding, authorization, and persistence retain their feature ownership. Centralize the existing theme asset byte limit for the reader, image processor, and multipart middleware.

`QuizQuestionMediaUploadReader` adapts GraphQL to a lazy application upload source. Opening that source resolves metadata without opening its content stream; reading the content buffers bytes through the shared reader using the application's byte limit and the quiz transport-error mapping. Its application-facing contract carries no GraphQL or stream dependency.

`QuizQuestionMediaPolicy` owns the accepted MIME types, maximum upload size, and non-empty content requirement in the domain. After authorizing the operation and validating question inputs, the existing create/update use cases call `QuizQuestionMediaPreparationService`. It opens the source with the policy's limit, checks MIME metadata before reading content, validates the resulting byte count, and constructs the media input. `MediaMutationService` then publishes that prepared media and compensates failed persistence under [ADR 0018](./0018-support-media-on-quiz-questions.md). This keeps acceptance rules effective for every transport without introducing a separate upload use case.

Adapters may specify the encoding of string chunks: text uploads retain UTF-8, while quiz media preserves its existing byte-oriented Latin-1 behavior. Stream iteration, size enforcement during reading, single consumption, and cleanup remain shared. Content probing and decoding remain processor responsibilities; declared MIME validation does not replace them.

No GraphQL schema or frontend changes are required.

## Consequences

### Positive

- One implementation handles upload resolution, stream limits, failures, and cancellation cleanup.
- Each feature retains its existing error code and size policy.
- Imports continue to stream rather than loading entire CSV files into memory.

### Negative

- Upload adapters and their tests need an injected shared reader.
- Future consumers must still define their own validation and persistence policies.

### Follow-Up

- Cover exact byte limits, rejected uploads, stream failures, early cancellation, and split UTF-8 sequences.
- Run the existing multipart integration tests and theme authorization tests.

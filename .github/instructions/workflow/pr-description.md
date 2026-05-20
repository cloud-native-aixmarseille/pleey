# Pleey Pull Request Description Instructions

Write pull request descriptions as concise, reviewer-oriented summaries because reviewers need outcome, risk, and validation faster than they need a changelog.

- Start with the user-facing or architectural outcome before implementation details because that frames the review.
- Explain the main changes in grouped themes, not as a file-by-file changelog, because grouped changes are easier to review.
- Call out risks, migrations, configuration changes, or follow-up work because reviewers need to know what can break outside the diff.
- Mention validation that actually ran, such as `make ci`, focused tests, or targeted checks, because claimed coverage should be auditable.
- Keep the tone factual and specific, and avoid filler, because generic PR descriptions waste reviewer time.

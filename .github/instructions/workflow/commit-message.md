# Pleey Commit Message Instructions

Generate commit messages with Conventional Commits because the repository history and release flow depend on them.

- Use the format `<type>[scope]: <description>`.
- Prefer the workspace commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`.
- Keep the subject line concise, imperative, and specific because searchable history is more valuable than generic summaries.
- Choose a scope when the affected feature or app is clear because scoped commits are easier to scan in release history.
- Do not mention AI tooling, code generation, or generic phrases like "update files" because the message should describe the software change, not how it was produced.

Examples:

- `fix(auth): handle guest session refresh`
- `refactor(frontend): split party lobby accessibility rules`

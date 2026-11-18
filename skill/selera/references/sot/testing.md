# Tests, documentation, security, tooling

> Last verified: 2026-11-16

Scope: test strategy, docs, security practices, automation.

## Tests

- Backend: pyramid. Frontend: trophy. E2E only for critical paths.
- AAA or BDD structure. Test names state the behavior: `returns 409 when stock is zero`.
- Deterministic: no `sleep`, faked time, or nested random data. Flaky tests are fixed or deleted.
- Integration tests use a real database (Testcontainers). Do not mock the ORM.
- Coverage is a signal, not a target.

## Documentation

- Comments explain why, not what.
- Public APIs are documented: TSDoc, JSDoc, Python docstrings.
- `TODO`, `FIXME`, and `HACK` must include a reason and an owner.
- Dead code is deleted, not commented out.
- ADRs in `docs/adr/` for decisions that change direction.

## Security

- No secrets in code, logs, or git. Scan in pre-commit and CI.
- Parameterized queries, escaped output, CSP, upload validation based on file contents.
- Close connections and files in `finally`, cap pagination, prevent N+1 queries.

## Tooling

| Need | Example tools (pick by language and repo) |
|---|---|
| Format | Oxfmt, Prettier, Black, gofmt, rustfmt |
| Lint | Oxlint, Biome, ESLint, Ruff, golangci-lint, Clippy |
| Architecture boundaries | dependency-cruiser, eslint-plugin-boundaries |
| Dead code | knip |
| Hooks | Lefthook, or Husky + lint-staged |
| Commits | commitlint in CI |

# Engineering practices

> Last verified: 2026-11-19
> Checked on the web 2026-11-19: RFC 9457, corepack, OpenFeature providers, varlock, Garage and SeaweedFS. Not checked: opossum, gobreaker, t3-env, caarlos0/env, Scalar, Fumadocs.

Scope: error handling, config, feature flags, documentation, ADRs, onboarding, local dev, code review.

## Error handling

- Separate expected errors (validation, not found) from unexpected ones (bugs, infrastructure). Friendly messages to the client, details in the logs.
- Public HTTP: RFC 9457 Problem Details. tRPC/oRPC: the built-in format + `request_id`.
- Timeouts are required (`AbortController`, Go `context`). Retries with backoff and a limit. Retry writes only with an `Idempotency-Key`. Circuit breaker optional (opossum, gobreaker).
- Go: wrap with `%w`. TS: a typed `AppError` or a Result type. Rust: thiserror (libraries), anyhow (apps).
- Fail closed on auth errors. Never swallow errors.

## Configuration

12-factor: config from env vars, validated at startup, fail fast. Commit `.env.example`, never `.env`. TS: Zod, t3-env, or varlock. Go: caarlos0/env. Secrets come from a secrets manager ([security.md](security.md)).

## Feature flags

Evaluate through OpenFeature so the provider can be swapped. Providers: PostHog (flags + analytics), GrowthBook (experiments), Unleash or Flagsmith (self-hosted), LaunchDarkly (enterprise). Default off, with an owner and a removal date. Evaluate server-side for sensitive logic. Rollout: internal, then a small percentage, then gradual increases, with a kill switch.

## Documentation and ADRs

- Docs live in the repo and are updated in the same PR. The README must be runnable: quick start, prerequisites, dev, test, deploy, env.
- API: OpenAPI + Scalar. Events: AsyncAPI. Diagrams: Mermaid. Docs site: Starlight, Fumadocs, or VitePress.
- Summary for agents: `AGENTS.md` (how to run, structure, stack decisions, ADR links).
- ADRs in `docs/adr/NNN-title.md`, format: Status, Date, Context, Decision, Consequences, Alternatives. Immutable once Accepted; replace with a new ADR. Write one when choosing a framework, DB, auth, architecture style, or deviating from the defaults in [architecture.md](architecture.md).
- Runbooks: deploy, rollback, common alerts, log access, on-call contacts.

## Local development and onboarding

- One command (`make dev`, `vp dev`, or `docker compose up`). Target: clone to running in under 30 minutes.
- Pin runtime versions: mise, `packageManager` + corepack (not bundled with Node 25+, run `npm install -g corepack`). Optional: Dev Containers / Codespaces.
- Local compose: Postgres, Redis/Valkey, Garage or SeaweedFS, Mailpit. Docker Compose Watch for reloads.
- Idempotent seeds, a complete `.env.example`, clear error messages when a service is missing.
- Day one: access to the repo, CI, secrets, and observability; local setup; run the tests; read the architecture. First task is small: docs, a small bug, or a test.

## Code review

Conventional Commits. Check: the logic is correct, tests are added, error handling, no secrets, performance impact, docs updated, follows the project's patterns. CODEOWNERS and required checks.

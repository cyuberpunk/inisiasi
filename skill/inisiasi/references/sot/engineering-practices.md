# Engineering practices

> Last verified: 2026-11-20
> Checked on the web 2026-11-20: OpenFeature server SDK 1.23, GrowthBook 4.1 and `@growthbook/growthbook` 2.2, Statsig `@statsig/js-client` 3.33, and their download counts. Carried over from 2026-11-19: RFC 9457, corepack, OpenFeature providers, varlock, Garage and SeaweedFS. Not checked: opossum, gobreaker, t3-env, caarlos0/env, Scalar, Fumadocs.

Scope: error handling, config, feature flags, experiments, documentation, ADRs, onboarding, local dev, code review.

## Error handling

- Separate expected errors (validation, not found) from unexpected ones (bugs, infrastructure). Friendly messages to the client, details in the logs.
- Public HTTP: RFC 9457 Problem Details. tRPC/oRPC: the built-in format + `request_id`.
- Timeouts are required (`AbortController`, Go `context`). Retries with backoff and a limit. Retry writes only with an `Idempotency-Key`. Circuit breaker optional (opossum, gobreaker).
- Go: wrap with `%w`. TS: a typed `AppError` or a Result type. Rust: thiserror (libraries), anyhow (apps).
- Fail closed on auth errors. Never swallow errors.

## Configuration

12-factor: config from env vars, validated at startup, fail fast. Commit `.env.example`, never `.env`. TS: Zod, t3-env, or varlock. Go: caarlos0/env. Secrets come from a secrets manager ([security.md](security.md)).

## Feature flags

Evaluate through OpenFeature (server SDK 1.23) so the provider can be swapped. Providers: PostHog (flags + analytics), GrowthBook (experiments), Statsig (`@statsig/js-client` 3.33, 4.75M/wk), Unleash or Flagsmith (self-hosted), LaunchDarkly (enterprise). Default off, with an owner and a removal date. Evaluate server-side for sensitive logic. Rollout: internal, then a small percentage, then gradual increases, with a kill switch.

## Experiments

A flag decides who sees a feature. An experiment decides what to ship. An experiment without a sample size, a primary metric, and a stopping rule is an opinion with a percentage attached.

- Hypothesis first, written down: "changing X will move metric Y by Z, because...". If it cannot fail, it is not an experiment.
- One primary metric, declared before the run. Secondary and guardrail metrics (latency, error rate, cancellation, revenue) get their own limits, and a guardrail break stops the run.
- Sample size before the start, from the expected effect and the baseline rate. A test that reads results daily and stops when it looks good is measuring noise.
- Decide the duration first. One or two full business cycles, so day-of-week effects wash out. Never stop early on a positive trend.
- Randomize per user, not per session, and sticky. The same user must land on the same variant across devices and visits.
- The control and the variant get the same instrumentation, sent from the same place. A different tracking path for one arm is the most common false result.
- Analyze cohorts, not raw totals: new vs returning, platform, plan. An average shift that hides a segment regression is still a regression.
- Assign exposure only when the user actually reaches the feature, so the denominator is not inflated.
- Record each experiment: date, hypothesis, metrics, sample size, result, decision. A repo file or the provider's archive, not chat.

Tools: GrowthBook 4.1 (self-host or cloud, warehouse-native analysis, 1.66M/wk on the React SDK), Statsig (self-host or cloud), PostHog experiments (if already using PostHog for analytics). Keep flags on OpenFeature so the flag provider can change without touching the code.

Avoid: an experiment on a metric with no baseline, more than one variant change at a time, peeking, and stopping the test for a result that does not clear the sample size.

## Documentation and ADRs

- Docs live in the repo and are updated in the same PR. The README must be runnable: quick start, prerequisites, dev, test, deploy, env.
- API: OpenAPI + Scalar. Events: AsyncAPI. Diagrams: Mermaid. Docs site: Starlight 0.43, Fumadocs 16.19, Docusaurus 3.10, or VitePress. Generated clients and hosted docs: [api.md](api.md).
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

# Architecture

> Last verified: 2026-11-19
> Checked on the web 2026-11-19: dependency-cruiser, Debezium, Temporal, Restate, Emmett, KurrentDB, pg-boss, Graphile Worker, River, Turso status.

Scope: architecture defaults, patterns, layering, events, multi-tenancy. Common problems: [problems-critical.md](problems-critical.md), [problems-data.md](problems-data.md).

## Cross-stack principles

These apply regardless of language or framework.

- Modular first. Split into services only when team ownership, scale, and data boundaries are clear.
- Module boundaries are enforced in CI, not in documents.
- Mutations of money, stock, orders, and webhooks must be idempotent.
- Every outgoing call has a timeout, bounded retries, and a way to cancel.
- Schemas change in stages: expand, migrate, contract. No in-place renames or type changes.
- Index the columns used in filters and joins. Measure first, then optimize.
- A backup only counts as existing after a restore test passes.
- Structured logs, without secrets and excess PII.
- Errors fail closed on auth; fail open only on non-critical features.
- One source of truth per piece of data. Sync through events, not dual writes.

## Defaults

| Decision | Default | When it differs |
|-----------|---------|------------|
| Style | Modular monolith | Split into services only when team ownership, scaling, and data boundaries are clear |
| Module boundaries | Bounded contexts, no internal imports across modules | Enforce in CI (dependency-cruiser, architecture tests) |
| Database | PostgreSQL | SQLite/Turso for simple apps or edge |
| Layering | Typed queries at the module boundary + integration tests | Repository + service only for complex domains. Not for CRUD on Drizzle/Prisma |
| Events | Outbox + idempotent consumer | Do not dual-write to the DB and the broker |
| Critical mutations | Idempotent (client key) | Payments, orders, stock, webhooks, jobs |
| Transactions | Short, external I/O outside | Do not call HTTP inside a transaction |
| API changes | Backward compatible | Breaking changes only with a new version and a transition period |
| Observability | From day one | [observability.md](observability.md) |

Module structure: `modules/<domain>/` contains routes, services, queries, and schema (vertical slices per feature are fine). Keep the shared kernel minimal. Managed backends (Convex) are valid for prototypes or realtime apps, with the vendor trade-off. Local-first: [offline-sync.md](offline-sync.md).

## Patterns

| Pattern | Use when |
|------|-------------|
| Outbox + Inbox | Reliable event publishing from a DB transaction, relayed by a poller or CDC (Debezium). Consumers store event IDs |
| Strangler Fig | Gradual migration from a legacy system |
| Saga | Transactions across services. Prefer orchestration (Temporal, Restate) |
| CQRS | Reads and writes differ greatly. Not a default |
| Event sourcing | Full audit and replay are truly required (ledger). Store: append-only Postgres (TS: Emmett) or KurrentDB. Keep PII outside events or use crypto-shredding so deletion rights still work. Not a default |
| BFF | Different clients need different data shapes |
| Circuit breaker | An external dependency is unstable |
| Feature-Sliced / feature folders | One large frontend app |

## Postgres as a queue

`LISTEN/NOTIFY` is only a signal and can be lost. A table queue + `FOR UPDATE SKIP LOCKED` is safe up to moderate load; libraries: pg-boss, Graphile Worker, River.

## Multi-tenancy

Details: [multi-tenancy.md](multi-tenancy.md). Default: shared DB + `tenant_id` + RLS, deny by default.

## Avoid

Microservices from day one. A repository layer on top of an ORM for CRUD. Event sourcing without an audit or replay need. A shared database between services.

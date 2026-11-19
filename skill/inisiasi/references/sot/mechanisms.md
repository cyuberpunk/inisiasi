# Mechanisms

> Last verified: 2026-11-19
> Checked on the web 2026-11-19: Postgres advisory lock functions, PgBouncer transaction pooling limits.
> Status: draft, pending owner review.

Scope: small, reusable mechanisms that make a system correct under retries, concurrency, and failure. Larger architecture patterns (outbox, saga, CQRS): [architecture.md](architecture.md). Failure catalog: [problems-critical.md](problems-critical.md).

## Mechanisms

| Mechanism | Use when | How |
|------|-------------|-----|
| Idempotency key | A client may retry a mutation (payments, orders, webhooks) | Client sends a key, server stores key + result in the same transaction, a repeat returns the stored result. Conflict codes: [api.md](api.md) |
| Optimistic concurrency | Two writers may edit the same row | `version` column, `UPDATE ... WHERE id = $1 AND version = $2`, zero rows means conflict |
| Lease | One worker at a time owns a job or resource | Row with owner and expiry, renewed by heartbeat, taken over after expiry. Writes carry a fencing token so a stale owner is rejected |
| Advisory lock | One instance at a time runs a task (cron, migration) | `pg_try_advisory_xact_lock` inside a short transaction. Long tasks: `pg_try_advisory_lock` on a direct connection, unlocked in `finally`. Session-level locks break under PgBouncer transaction pooling |
| Retry with backoff | A call fails transiently | Exponential backoff, full jitter, max attempts, retry only retryable errors |
| Timeout and deadline | Any outgoing call | Timeout per call, a deadline passed down so nested calls share the budget |
| Circuit breaker | A dependency fails often | Open after N failures, fail fast, probe after a cooldown |
| Rate limit | Protect an endpoint or a vendor quota | Per key, in Redis/Valkey or at the edge. Algorithm, keys, headers: [api-ops.md](api-ops.md) |
| Backpressure | Producers outpace consumers | Bounded queues, reject or shed load instead of growing memory |
| Dedupe on consume | A message may arrive twice | Store processed message IDs, skip repeats |
| Cache-aside | Reads dominate and staleness is acceptable | Read cache, fall back to the source, write with TTL, invalidate on write. Stampede and stores: [data-services.md](data-services.md) |
| Feature flag | Ship code before enabling it | Flag checked at one place, removed after rollout. Providers: [engineering-practices.md](engineering-practices.md) |
| Kill switch | A feature can hurt production | A flag operators can flip without a deploy |

## Rules

- Pick the mechanism where the invariant lives. Idempotency belongs in the write path, not in the client.
- Every mechanism has a test that triggers it: a duplicate request, a concurrent write, an expired lease.
- Log when a mechanism fires (conflict, retry, breaker open). Silent mechanisms hide incidents.

## Avoid

- Retries without idempotency.
- Distributed locks across services when a database constraint or lease would do.
- Caches without an invalidation rule.

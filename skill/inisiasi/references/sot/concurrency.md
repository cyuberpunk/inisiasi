# Concurrency

> Last verified: 2026-11-18
> Status: draft, pending owner review.

Scope: concurrency models per runtime, race conditions, isolation levels, cancellation. Locks, leases, retries as mechanisms: [mechanisms.md](mechanisms.md). Lost updates on money and stock: [problems-critical.md](problems-critical.md). Deadlocks: [problems-data.md](problems-data.md).

## Concurrency is not parallelism

Concurrency is many tasks in progress at once (waiting on I/O). Parallelism is many tasks running at the same instant (on several cores). Web backends are mostly I/O-bound, so concurrency matters more than parallelism.

## Models per runtime

| Runtime | Model | Rules |
|---------|-------|-------|
| Node.js, Bun, Deno | One event loop, async I/O | Never block the loop: CPU work goes to worker threads or a queue. Bound concurrency of outgoing calls (p-limit) |
| Go | Goroutines, channels | `context.Context` on every call for cancellation and deadlines. `errgroup` for fan-out. Run `-race` in tests |
| Python | `asyncio` for I/O, processes for CPU | Do not mix blocking libraries into async code. `TaskGroup` for structured concurrency |
| Swift | `async/await`, actors | Shared mutable state lives in an actor. Structured concurrency (`async let`, task groups) over detached tasks |
| JVM, .NET | Threads, virtual threads (Java 21+), `async/await` (.NET) | Bounded thread pools, no unbounded executors |

## Race conditions

| Race | Fix |
|------|-----|
| Read, compute, write (lost update) | Atomic update with a guard, or optimistic concurrency with a `version` column |
| Check, then act (unique email, slot booking) | A database constraint (`UNIQUE`, exclusion constraint), handle the conflict error |
| Two workers take the same job | `FOR UPDATE SKIP LOCKED` or a lease |
| Duplicate request | Idempotency key |
| Shared in-memory state across requests | Remove it, or guard it with an actor or a mutex in one process only |

## Isolation levels (Postgres)

| Level | Use when |
|-------|----------|
| Read committed (default) | Most work, combined with atomic updates, constraints, and row locks |
| Repeatable read | A report or export needs one consistent snapshot. Concurrent writers get `40001`, retry |
| Serializable | Complex invariants across rows that are hard to lock explicitly. Retry on serialization failure (`40001`) |

## Cancellation and limits

- Every request carries a deadline. Cancel downstream calls and queries when the client disconnects or the deadline passes (`AbortSignal`, `context`, task cancellation).
- Bound every pool and queue: connections, workers, in-flight requests. Unbounded concurrency moves the outage to the database.

## Avoid

- Application-level checks for uniqueness without a constraint.
- Redis locks as a substitute for database guarantees.
- Fire-and-forget promises or goroutines with no error handling and no cancellation.

# Operational problems

> Last verified: 2026-11-16

Scope: deploys, dependencies, queues, resources. Observability: [observability.md](observability.md).

| Problem | Prevent with |
|---------|--------------|
| Memory or connections grow, recover after a restart | `finally` blocks, bounded caches, cleanup of listeners and timers |
| Dependency with no timeout | Timeouts, retries with jitter + a budget, bulkheads, then a circuit breaker |
| Retries make an outage worse | Backoff + jitter, gradual reconnects |
| Unbounded queues | Depth limits, depth monitoring, reject or slow down producers |
| Messages that keep failing | Bounded retries, a dead letter queue, alerts on the DLQ |
| Requests drop during a deploy | Catch SIGTERM, fail readiness, drain |
| Wrong health checks | Shallow liveness, bounded readiness |
| Costs balloon | Budgets + alerts, short log retention, shut down non-production |

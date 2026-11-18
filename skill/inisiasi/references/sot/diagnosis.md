# Quick diagnosis

> Last verified: 2026-11-16

Scope: from symptoms to causes, and the order to check them in. Prevention details: [problems-critical.md](problems-critical.md), [problems-performance.md](problems-performance.md), [problems-data.md](problems-data.md), [problems-ops.md](problems-ops.md).

| Symptom | Check first |
|--------|----------|
| Slow only in production | N+1 queries, missing indexes |
| Intermittently wrong data under load | Lost updates, races |
| Recovers after a restart, then degrades again | Leaks |
| Spike after a deploy or cache expiry | Stampede, thundering herd |
| Requests drop during a deploy | Graceful shutdown, readiness |
| Users see other users' data | IDOR, RLS |
| Instance healthy but a dependency is down | Readiness vs liveness |
| Deadlock or serialization errors | Long transactions, lock ordering |
| Connection acquisition timeouts, low DB CPU | Pool exhaustion, slow queries |

Order: confirm the symptom, check metrics and logs, look at the last change, then change one thing at a time.

# Performance problems

> Last verified: 2026-11-16

Scope: slowness and resource exhaustion. Target numbers: [performance.md](performance.md).

| Problem | Prevent with |
|---------|--------------|
| One query per item in a loop (N+1) | Join/include, batch `IN (...)`, DataLoader |
| Full table scans | Indexes on filter/join columns, `EXPLAIN ANALYZE`, `pg_stat_statements` |
| Connections exhausted in serverless (Prisma/Neon) | A pooled URL for runtime, a direct URL for migrations, pool of 1-2 per isolate, client cached globally |
| PgBouncer breaks sessions | `SET LOCAL`, direct URL for migrations |
| Large `OFFSET` in lists | Cursor/keyset pagination with a unique tie-breaker |
| INP > 200 ms | Split long tasks, defer third-party scripts |
| Sequential fetches in RSC | `Promise.all`, prefetching, per-request cache |
| Heavy CPU work on the Node/Bun main thread | Worker threads or a separate process |
| Spike when a cache expires | Singleflight, early expiration, TTL jitter |

Queries and indexes first. Caching and micro-optimizations only after measuring.

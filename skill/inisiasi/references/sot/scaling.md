# Scaling

> Last verified: 2026-11-18
> Status: draft, pending owner review.

Scope: handling more load: vertical and horizontal scaling, load balancing, read scaling, partitioning, and when to split services. Caches: [data-services.md](data-services.md). Load tests: [reliability.md](reliability.md). Slowness symptoms: [problems-performance.md](problems-performance.md).

## Order of moves

Take the first step that fixes the measured bottleneck. Measure again before the next.

1. Fix the query or the code: indexes, N+1, payload size, missing pagination.
2. Scale up: a bigger instance or database plan. Cheapest in engineering time.
3. Cache: HTTP cache and CDN for public reads, application cache for expensive computed reads.
4. Scale out the stateless tier behind a load balancer.
5. Move slow work to queues and workers.
6. Read replicas for read-heavy traffic.
7. Partition large tables (Postgres declarative partitioning by time or tenant).
8. Shard or split services only when one database or one team cannot carry the load.

## Defaults

| Decision | Default | When it differs |
|-----------|---------|------------|
| App tier | Stateless processes: sessions in a cookie or store, files in object storage, no local disk state | Sticky sessions only for WebSocket servers, and even then keep state recoverable |
| Load balancing | The platform's load balancer (Cloudflare, Fly, ALB) with health checks and connection draining | Your own (Envoy, HAProxy) only with a platform team |
| Autoscaling | On CPU or request concurrency, with a max to cap cost | Queue workers scale on queue depth |
| Database connections | A pooler (PgBouncer, provider pooler). Connections = pool size x instances, kept under the database limit | None |
| Read replicas | Read-only queries that tolerate lag (lists, reports) | Read-your-writes paths stay on the primary |
| Partitioning | By time for append-heavy data (events, logs), by tenant for large multi-tenant tables | None below tens of millions of rows |
| Edge | CDN for static and cacheable responses, `Cache-Control` set on purpose | Edge compute when latency to users matters more than latency to the database |

## Rules

- Every scaling change starts from a measurement and a target (p95 latency, throughput) and ends with a load test.
- Horizontal scale assumes idempotent handlers and no in-process state. Check both before adding instances.
- Replica lag is a product decision. Name which screens may show stale data.
- Hot keys (one tenant, one product) break even sharding. Detect them before choosing a partition key.
- Set limits everywhere: request size, timeouts, concurrency per instance, queue length.

## Avoid

- Microservices or sharding as the first scaling move.
- Scaling the app tier while the database is the bottleneck.
- Caches that hide a slow query instead of fixing it, unless the read is inherently expensive.

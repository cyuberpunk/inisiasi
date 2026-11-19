# Cache, queue, job, storage, search

> Last verified: 2026-11-19
> Checked on the web 2026-11-19: Redis 8 and Valkey licenses, MinIO, R2, queue and search tools, Postgres FTS languages.

Scope: cache, messaging, background jobs, object storage, full-text search. Realtime: [realtime.md](realtime.md).

## Cache

- Store: Valkey (BSD, default open source) or Redis 8 (RSALv2/SSPL/AGPLv3 licensing). Serverless: Upstash. Workers: KV / Cache API.
- Patterns: cache-aside, always with a TTL, invalidation by TTL + delete on write, namespaced keys (`user:{id}`).
- Stampede: singleflight, randomized early expiration, a lock during refresh.
- HTTP: `Cache-Control` + `stale-while-revalidate`, ETag, cache tags / purge. Do not cache personal data in a public cache.
- A Redis lock (`SET NX PX`) is advisory only. For data correctness: conditional writes, fencing tokens, or a Postgres lock.

## Queues and background jobs

Use what the stack already has first.

| Already have | Use |
|-------------|-----|
| Postgres (TS) | pg-boss or Graphile Worker |
| Postgres (Go) | River |
| Redis/Valkey | BullMQ (TS), Asynq (Go) |
| Python | Dramatiq (simple), Celery (complex workflows), procrastinate (Postgres) |
| Laravel | Laravel Queues (Redis + Horizon, or the database driver when small) |
| Spring | JobRunr, Spring for Kafka or AMQP, ShedLock for scheduled jobs |
| Rails | Solid Queue (database), Sidekiq (Redis, high throughput) |
| .NET | Hangfire, Quartz.NET, Wolverine |
| Cloudflare Workers | Queues + Cron Triggers |
| Convex | Scheduled functions + cron |
| Multi-step SaaS jobs in TS | Inngest or Trigger.dev |

Move to NATS JetStream (cross-language fan-out) or Kafka (throughput, retention, replay) only when needed. Redpanda's free edition now ships under a no-source license (50-core cap, internal use only). Long-running workflows / sagas: Temporal or Restate.

Rules: at-least-once delivery + idempotent handlers, payloads contain only IDs, unique keys, retry with backoff, a DLQ, enqueue inside the DB transaction (Postgres queue or outbox), graceful shutdown, monitor queue depth. In-process cron (node-cron) is only safe on a single instance. Fan-out that must be durable: Streams/JetStream, not plain Pub/Sub.

## Object storage

- Use: S3, Cloudflare R2 (no egress fees), GCS, Supabase Storage (if the stack is Supabase). Self-hosted: SeaweedFS, Garage, or Ceph RGW.
- Private buckets: Block Public Access + bucket policy. ACLs disabled (bucket owner enforced). Access through presigned URLs with a short TTL.
- Uploads: the client requests a presigned URL (restrict type, size, key), uploads directly, then the server verifies the object (exists, size, type from magic bytes) before saving metadata. Multipart or TUS for large files.
- Images: resize and convert to AVIF/WebP (sharp, imgproxy, or a CDN service).
- CDN in front of public assets. Lifecycle rules for temporary files.
- Avoid: MinIO (repository archived), the `public-read` ACL header.

## Search

- Start with the database you have: Postgres FTS (`tsvector`, `pg_trgm`; for Indonesian locale use the built-in `indonesian` config, or `simple` to skip stemming), SQLite FTS5, Atlas Search, Convex search. Stay in Postgres but need BM25/facets: ParadeDB.
- Dedicated search (typo tolerance, facets, autocomplete): Meilisearch or Typesense. Large scale or logs: OpenSearch / Elasticsearch. Managed: Algolia.
- Vectors: pgvector first. Hybrid search (keyword + vector) when relevant.
- Sync the index through an outbox or CDC, not a dual write in the request.

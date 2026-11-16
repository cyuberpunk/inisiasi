# Cache, queue, job, storage, search

> Terakhir diverifikasi: 2026-11-16

Scope: cache, messaging, background job, object storage, full-text search. Realtime: [realtime.md](realtime.md).

## Cache

- Store: Valkey (BSD, default OSS) atau Redis 8 (lisensi RSALv2/SSPL/AGPLv3). Serverless: Upstash. Workers: KV / Cache API.
- Pola: cache-aside, selalu TTL, invalidasi TTL + delete saat write, key ber-namespace (`user:{id}`).
- Stampede: singleflight, early expiration acak, lock saat refresh.
- HTTP: `Cache-Control` + `stale-while-revalidate`, ETag, cache tag / purge. Jangan cache data personal di cache publik.
- Lock Redis (`SET NX PX`) hanya advisory. Untuk kebenaran data: conditional write, fencing token, atau lock Postgres.

## Queue dan background job

Pakai yang sudah ada di stack dulu.

| Sudah punya | Pakai |
|-------------|-------|
| Postgres (TS) | pg-boss atau Graphile Worker |
| Postgres (Go) | River |
| Redis/Valkey | BullMQ (TS), Asynq (Go) |
| Python | Dramatiq (simpel), Celery (workflow kompleks), procrastinate (Postgres) |
| Cloudflare Workers | Queues + Cron Triggers |
| Convex | Scheduled functions + cron |
| Job multi-step SaaS TS | Inngest atau Trigger.dev |

Naik ke NATS JetStream (fan-out lintas bahasa) atau Kafka / Redpanda (throughput, retention, replay) hanya jika perlu. Workflow panjang/saga: Temporal atau Restate.

Aturan: at-least-once + handler idempotent, payload berisi ID saja, unique key, retry backoff, DLQ, enqueue dalam transaksi DB (Postgres queue atau outbox), graceful shutdown, pantau kedalaman antrean. Cron in-process (node-cron) hanya aman di satu instance. Fan-out yang harus durable: Streams/JetStream, bukan Pub/Sub biasa.

## Object storage

- Pakai: S3, Cloudflare R2 (tanpa biaya egress), GCS, Supabase Storage (jika stack Supabase). Self-host: SeaweedFS, Garage, atau Ceph RGW.
- Bucket privat: Block Public Access + bucket policy. ACL dimatikan (Bucket owner enforced). Akses lewat presigned URL dengan TTL pendek.
- Upload: klien minta presigned URL (batasi tipe, ukuran, key), upload langsung, lalu server verifikasi objek (ada, ukuran, tipe dari magic bytes) sebelum simpan metadata. Multipart atau TUS untuk file besar.
- Gambar: resize dan konversi AVIF/WebP (sharp, imgproxy, atau layanan CDN).
- CDN di depan aset publik. Lifecycle rule untuk file sementara.
- Hindari: MinIO (repo diarsipkan), header ACL `public-read`.

## Search

- Mulai dari DB yang ada: Postgres FTS (`tsvector`, `pg_trgm`; locale Indonesia pakai config `simple`), SQLite FTS5, Atlas Search, Convex search. Tetap di Postgres tapi butuh BM25/facets: ParadeDB.
- Search terpisah (typo tolerance, facets, autocomplete): Meilisearch atau Typesense. Skala besar atau log: OpenSearch / Elasticsearch. Managed: Algolia.
- Vektor: pgvector dulu. Search hybrid (keyword + vektor) jika relevan.
- Sinkron index lewat outbox atau CDC, bukan dual write di request.

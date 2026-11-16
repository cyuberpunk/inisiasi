# Masalah performa

> Terakhir diverifikasi: 2026-11-16

Scope: lambat dan habis resource. Target angka: [performance.md](performance.md).

| Masalah | Cegah dengan |
|---------|--------------|
| Query per item di loop (N+1) | Join/include, batch `IN (...)`, DataLoader |
| Scan penuh | Index kolom filter/join, `EXPLAIN ANALYZE`, `pg_stat_statements` |
| Koneksi habis di serverless (Prisma/Neon) | URL pooled untuk runtime, direct URL untuk migrate, pool 1-2 per isolate, client di-cache global |
| PgBouncer mematahkan session | `SET LOCAL`, direct URL untuk migrate |
| `OFFSET` besar di list | Cursor/keyset dengan tie-breaker unik |
| INP > 200ms | Pecah long task, tunda script pihak ketiga |
| Fetch berurutan di RSC | `Promise.all`, prefetch, cache per request |
| CPU berat di thread utama Node/Bun | Worker thread atau proses terpisah |
| Lonjakan saat cache expire | Singleflight, early expiration, TTL jitter |

Query dan index dulu. Cache dan optimasi mikro hanya setelah diukur.

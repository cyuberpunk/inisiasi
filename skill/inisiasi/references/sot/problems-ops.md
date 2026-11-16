# Masalah operasional

> Terakhir diverifikasi: 2026-11-16

Scope: deploy, dependency, antrean, resource. Observability: [observability.md](observability.md).

| Masalah | Cegah dengan |
|---------|--------------|
| Memori/koneksi naik, pulih setelah restart | `finally`, cache berbatas, cleanup listener/timer |
| Dependency tanpa timeout | Timeout, retry dengan jitter + budget, bulkhead, lalu circuit breaker |
| Retry memperbesar outage | Backoff + jitter, reconnect bertahap |
| Antrean tak terbatas | Batas kedalaman, monitor depth, tolak atau perlambat produser |
| Pesan gagal terus | Retry terbatas, dead letter queue, alert di DLQ |
| Request putus saat deploy | Tangkap SIGTERM, gagalkan readiness, drain |
| Health check salah | Liveness dangkal, readiness bounded |
| Biaya membengkak | Budget + alert, retensi log pendek, matikan non-prod |

# Arsitektur

> Terakhir diverifikasi: 2026-11-16

Scope: default keputusan arsitektur, pola, layering, event, multi-tenancy. Masalah umum: [problems-critical.md](problems-critical.md), [problems-data.md](problems-data.md).

## Prinsip lintas stack

Berlaku apa pun bahasanya dan framework-nya.

- Modular dulu. Pecah service hanya jika ownership tim, skala, dan batas datanya sudah jelas.
- Batas modul ditegakkan di CI, bukan di dokumen.
- Mutasi uang, stok, order, dan webhook harus idempotent.
- Setiap panggilan keluar punya timeout, retry berbatas, dan cara membatalkan.
- Skema berubah bertahap: expand, migrate, contract. Tidak ada rename atau ubah tipe di tempat.
- Index di kolom filter dan join. Ukur dulu, baru optimasi.
- Backup baru dihitung ada setelah restore test lulus.
- Log terstruktur, tanpa secret dan PII berlebih.
- Error fail closed pada auth, fail open hanya pada fitur non-kritis.
- Satu sumber kebenaran per data. Sinkronisasi lewat event, bukan dual write.

## Default

| Keputusan | Default | Kapan beda |
|-----------|---------|------------|
| Gaya | Modular monolith | Pecah service hanya jika ownership tim, scaling, dan batas data sudah jelas |
| Batas modul | Bounded context, tanpa import internal lintas modul | Tegakkan di CI (dependency-cruiser, architecture test) |
| Database | PostgreSQL | SQLite/Turso untuk app sederhana atau edge |
| Layering | Query typed di batas modul + tes integrasi | Repository + service hanya untuk domain rumit. Bukan untuk CRUD Drizzle/Prisma |
| Event | Outbox + consumer idempotent | Jangan dual-write DB dan broker |
| Mutasi penting | Idempotent (key klien) | Payment, order, stok, webhook, job |
| Transaksi | Pendek, I/O eksternal di luar | Jangan panggil HTTP di dalam transaksi |
| Perubahan API | Backward compatible | Breaking hanya dengan versi baru + masa transisi |
| Observability | Sejak hari pertama | [observability.md](observability.md) |

Struktur modul: `modules/<domain>/` berisi route, service, query, schema (vertical slice per fitur boleh). Shared kernel minimal. Backend terkelola (Convex) sah untuk prototipe atau app realtime, dengan trade-off vendor. Local-first: [offline-sync.md](offline-sync.md).

## Pola

| Pola | Pakai kalau |
|------|-------------|
| Outbox + Inbox | Publish event andal dari transaksi DB, relay lewat poller atau CDC (Debezium). Consumer simpan event ID |
| Strangler Fig | Migrasi bertahap dari sistem lama |
| Saga | Transaksi lintas service. Prefer orchestration (Temporal, Restate) |
| CQRS | Read dan write sangat berbeda. Bukan default |
| Event sourcing | Audit penuh dan replay benar-benar wajib (ledger). Store: Postgres append-only (TS: Emmett) atau KurrentDB. PII di luar event atau crypto-shredding agar hak hapus tetap bisa. Bukan default |
| BFF | Klien berbeda butuh bentuk data berbeda |
| Circuit breaker | Dependency eksternal tidak stabil |
| Feature-Sliced / feature folders | Frontend besar satu app |

## Postgres sebagai antrean

`LISTEN/NOTIFY` hanya sinyal, bisa hilang. Antrean tabel + `FOR UPDATE SKIP LOCKED` aman sampai beban menengah; library: pg-boss, Graphile Worker, River.

## Multi-tenancy

Detail: [multi-tenancy.md](multi-tenancy.md). Default shared DB + `tenant_id` + RLS deny by default.

## Hindari

Microservices sejak hari pertama. Repository di atas ORM untuk CRUD. Event sourcing tanpa kebutuhan audit/replay. Shared database antar service.

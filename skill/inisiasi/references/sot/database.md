# Database

> Terakhir diverifikasi: 2026-11-16

Scope: pilihan database, host, ORM, migrasi skema. Pool, N+1, lock: [problems-data.md](problems-data.md).

## Default

- Produksi: PostgreSQL. Pakai kecuali ada alasan kuat.
- Prototipe, edge, mobile: SQLite (Turso, Cloudflare D1, expo-sqlite).
- Host Postgres: Neon (branching), Supabase (jika pakai ekosistemnya), Prisma Postgres, PlanetScale Postgres, AWS RDS/Aurora (enterprise).

| Engine | Pakai kalau | Catatan |
|--------|-------------|---------|
| PostgreSQL | Hampir semua app | Default |
| SQLite | Lokal, edge, mobile, prototipe | ALTER TABLE terbatas |
| MySQL | Sistem existing, Vitess | |
| MongoDB | Workload dokumen murni | Mongoose atau Prisma, bukan Drizzle |
| Redis / Valkey | Cache, session, queue | Bukan primary store |
| ClickHouse / DuckDB | Analitik | Pisah dari DB utama |

## Migrasi

- Tool: Drizzle Kit, Prisma Migrate, Atlas, golang-migrate, Alembic, sqlx-cli. Lint: Atlas lint atau Squawk.
- Breaking change: Expand (tambah, nullable) -> Migrate (dual write + backfill batch) -> Contract (hapus lama setelah cutover). Otomasi Postgres: pgroll.
- Jangan rename atau ubah tipe kolom di tempat.
- Postgres 11+: `ADD COLUMN ... DEFAULT <konstanta>` instan. Default volatile (`gen_random_uuid()`) me-rewrite tabel: tambah nullable, `SET DEFAULT`, backfill batch.
- Index di tabel besar: `CREATE INDEX CONCURRENTLY`. Constraint: `NOT VALID`, lalu `VALIDATE`.
- Set `lock_timeout` saat migrasi. Pisahkan migrasi skema dari migrasi data.
- Tes di database branch (Neon, PlanetScale) sebelum produksi.
- SQLite / D1 / Turso: rename atau ubah tipe sering berarti buat tabel baru lalu copy. Ikuti workflow ORM-nya.
- MySQL tabel besar: gh-ost atau pt-online-schema-change.

## Aturan

Index di FK dan filter yang sering. Hindari N+1. Pooling (PgBouncer / pooler provider) untuk serverless. Backup plus PITR. Migrasi forward-only di produksi.

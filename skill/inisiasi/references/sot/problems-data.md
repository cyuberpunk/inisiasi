# Masalah data dan transaksi

> Terakhir diverifikasi: 2026-11-16

Scope: transaksi, migrasi, konsistensi. Pola: [architecture.md](architecture.md).

| Masalah | Cegah dengan |
|---------|--------------|
| Transaksi terbuka saat HTTP call | I/O di luar transaksi (outbox) |
| Deadlock / serialization failure | Urutan lock konsisten, transaksi pendek, retry |
| Satu baris diperebutkan (hot row) | Update atomik, counter dipecah, antrean tulis |
| DDL mengunci tabel | Expand/contract, `CREATE INDEX CONCURRENTLY`, `lock_timeout` |
| DB dan broker tidak sinkron | Outbox + consumer idempotent |

Postgres tidak pernah dirty read dan tidak melakukan lock escalation (itu SQL Server). Gap lock adalah perilaku MySQL InnoDB. Risiko utama di Postgres adalah lost update di `READ COMMITTED`.

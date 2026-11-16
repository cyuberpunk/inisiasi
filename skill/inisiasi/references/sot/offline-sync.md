# Offline-first dan sync

> Terakhir diverifikasi: 2026-11-16

Scope: local-first, sync engine, konflik.

## Default

Mulai online-only. Naik bertahap: optimistic update + retry, lalu persistensi lokal untuk data kritis, lalu sync engine hanya jika offline benar-benar wajib.

| Platform | Local store |
|----------|-------------|
| Web | IndexedDB (Dexie), SQLite WASM, PGlite (persist IndexedDB/OPFS) |
| Expo / RN | expo-sqlite |
| Flutter | Drift |
| Native | SwiftData, Room, SQLite |

| Sync engine | Pakai kalau |
|-------------|-------------|
| Zero | Web + Postgres, partial query-based sync |
| PowerSync | Postgres ke mobile (termasuk RN) |
| Turso sync | DB sudah SQLite/Turso (offline write masih beta) |
| Electric | Read-path dari Postgres; write lewat API sendiri |
| Yjs, Automerge, Loro | Kolaborasi CRDT |

## Konflik

- Server authority untuk data bisnis. Field-level merge untuk dokumen. CRDT untuk kolaborasi.
- Last-write-wins jangan untuk pembayaran atau stok.
- Mutasi offline masuk antrean, operasi server idempotent, tampilkan status sync.

## Hindari

WatermelonDB, Isar resmi (tidak di-maintain), Replicache untuk project baru.

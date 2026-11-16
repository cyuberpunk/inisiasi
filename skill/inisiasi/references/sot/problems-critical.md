# Masalah kritis

> Terakhir diverifikasi: 2026-11-16

Scope: yang paling mahal kalau salah sejak awal. Baca sebelum menulis Risks di ARCHITECTURE.md. Untuk gejala saat incident: [diagnosis.md](diagnosis.md).

| Masalah | Cegah dengan |
|---------|--------------|
| Lost update uang/stok (app baca, hitung, tulis) | Update atomik + guard: `UPDATE ... SET stock = stock - :q WHERE id = :id AND stock >= :q`. Banyak field: optimistic locking (`version`). Beberapa baris: `SELECT ... FOR UPDATE`. Lock Redis bukan pengganti constraint DB |
| Double charge, order dobel | Idempotency key per aksi bisnis, simpan hasil pertama. Disable tombol tidak cukup |
| Event pembayaran palsu | Verifikasi signature + timestamp, lalu idempotent |
| Akses data milik orang lain (IDOR) | Authz di server per record, default deny, tes negatif |
| RLS bocor antar tenant | `FORCE ROW LEVEL SECURITY`, `SET LOCAL` per transaksi, policy fail-closed, view `security_invoker`, jangan `USING (true)` |
| Timeout ambil koneksi | Perbaiki query lambat, leak, dan transaksi panjang dulu. `statement_timeout`, `idle_in_transaction_session_timeout` |
| Uang pakai float | Integer satuan terkecil atau `numeric` |
| Secret di git atau log | Secrets manager, scan, redaksi log, rotasi bila bocor |
| Backup tak pernah di-restore | Restore test terjadwal |
| Injection | Schema di boundary, query berparameter, jangan interpolasi ke shell |
| CSRF | `SameSite` + CSRF token. Bearer header tidak kena CSRF klasik |
| JWT tidak divalidasi | Allowlist alg, cek `iss`, `aud`, `exp` |

Checkout: lost update, idempotency, webhook, money-float. Stok: lost update. Multi-tenant: RLS, IDOR. Upload: validasi isi, path traversal, ukuran.

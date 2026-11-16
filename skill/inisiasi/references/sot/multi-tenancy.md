# Multi-tenancy

> Terakhir diverifikasi: 2026-11-16

Scope: isolasi data antar tenant. Pola umum: [architecture.md](architecture.md). RLS salah: [problems-critical.md](problems-critical.md).

- Default: shared DB + kolom `tenant_id` + Row Level Security.
- RLS aman: set tenant per transaksi dengan `SET LOCAL app.tenant_id` (atau `set_config(..., true)`), aktifkan `FORCE ROW LEVEL SECURITY`, policy fail-closed: `tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid`. App connect sebagai role non-owner tanpa `BYPASSRLS`.
- `SET` tingkat session bocor antar tenant di PgBouncer transaction pooling. Selalu `SET LOCAL` dalam transaksi.
- Schema per tenant atau DB per tenant hanya untuk isolasi kontraktual, dengan biaya operasional lebih tinggi.
- Index diawali `tenant_id`. Rate limit dan kuota per tenant. Tes lintas tenant di CI.

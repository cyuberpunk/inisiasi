# Tes, dokumentasi, keamanan, tooling

> Terakhir diverifikasi: 2026-11-16

Scope: strategi tes, docs, praktik keamanan, otomasi.

## Tes

- Backend: pyramid. Frontend: trophy. E2E hanya jalur kritis.
- Struktur AAA atau BDD. Nama tes menyatakan perilaku: `returns 409 when stock is zero`.
- Deterministik: tanpa `sleep`, waktu dipalsukan, data acak bertingkat. Tes flaky diperbaiki atau dihapus.
- Integration pakai DB sungguhan (Testcontainers). Jangan mock ORM.
- Coverage sinyal, bukan target.

## Dokumentasi

- Komentar menjelaskan kenapa, bukan apa.
- API publik didokumentasikan: TSDoc, JSDoc, docstring Python.
- `TODO`, `FIXME`, `HACK` wajib berisi alasan dan pemilik.
- Kode mati dihapus, bukan dikomentari.
- ADR di `docs/adr/` untuk keputusan yang mengubah arah.

## Keamanan

- Secret tidak di kode, log, atau git. Scan di pre-commit dan CI.
- Query berparameter, escape output, CSP, validasi upload dari isi file.
- Tutup koneksi dan file di `finally`, batasi pagination, cegah N+1.

## Tooling

| Kebutuhan | Contoh tool (pilih sesuai bahasa dan repo) |
|---|---|
| Format | Oxfmt, Prettier, Black, gofmt, rustfmt |
| Lint | Oxlint, Biome, ESLint, Ruff, golangci-lint, Clippy |
| Batas arsitektur | dependency-cruiser, eslint-plugin-boundaries |
| Kode mati | knip |
| Hook | Lefthook atau Husky + lint-staged |
| Commit | commitlint di CI |
